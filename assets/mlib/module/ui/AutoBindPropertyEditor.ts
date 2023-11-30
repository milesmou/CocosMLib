import { Node, Component, _decorator } from "cc";
import { AutoBindProperty } from "./AutoBindProperty";
import { EDITOR } from "cc/env";
import { CCUtils } from "../../utils/CCUtil";
import { Utils } from "../../utils/Utils";

const { ccclass, executeInEditMode, menu } = _decorator;

/** 自动绑定字段的脚本 需配合插件一起使用 */
@ccclass
@executeInEditMode
export class AutoBindPropertyEditor extends Component {

    protected start(): void {
        if (!EDITOR) return;
        if (!this.isValid) return;
        this.scriptName = this.getCompName(this.getComponent(AutoBindProperty));
        this.checkAutoBind();
    }

    //#region 自定绑定属性代码

    private prefix = "$";
    private scriptName: string = "";

    private checkAutoBind() {
        if (!EDITOR) return;
        let str1 = "    //gen property start don't modify this area";
        let arr: string[] = [];
        let list = this.getPropertyInfo();
        for (const v of list) {
            let str = "";
            if (v.typeName)
                str = `    get ${v.pName}() { return this.getAutoBindComp("${v.path}", ${v.typeName}); }`;
            else
                str = `    get ${v.pName}() { return this.getAutoBindNode("${v.path}"); }`;
            arr.push(str);
        }
        let str2 = "    //gen property end don't modify this area ";
        // Editor.Ipc.sendToMain("miles-editor-tool:autoBind", this.scriptName, str1, str2, arr);
    }


    private getAutoBindRootNode(n: Node) {
        if (!EDITOR) return;
        return CCUtils.getComponentInParent(n, AutoBindProperty).node;
    }

    private getAllChilds() {
        if (!EDITOR) return;
        let arr: Node[] = [];
        let checkArr = [...this.node.children];
        arr.push(...checkArr);
        while (checkArr.length > 0) {
            let v = checkArr.shift();
            if (v.getComponent(AutoBindProperty)) continue;
            if (v.children.length > 0) {
                checkArr.push(...v.children);
                arr.push(...v.children);
            }
        }
        return arr;
    }

    private getPropertyInfo() {
        if (!EDITOR) return;
        let list: PropertyInfo[] = [];
        let arr = this.getAllChilds();
        for (const node of arr) {
            if (node.name.startsWith(this.prefix)) {
                if (this.getAutoBindRootNode(node) != this.node) continue;
                let path = this.getNodePath(node);
                let prefix = node.name.replace(this.prefix, "");
                prefix = prefix.replace(/[^_a-zA-Z0-9]/g, "");
                let comps = node.getComponents(Component);
                if (comps.length > 0) {
                    for (const comp of comps) {
                        let compName = this.getCompName(comp);
                        let suffix = CompNameMap[compName];
                        if (suffix || comp instanceof AutoBindProperty) {
                            if (!suffix) {
                                suffix = compName.replace(/[^_a-zA-Z0-9]/g, "");
                            }
                            let arr: string[] = suffix.split("|");
                            let pName = Utils.lowerFirst(prefix) + arr[0];
                            while (true) {
                                var find = list.find(v => v.pName == pName);
                                if (find == null) break;
                                else pName = pName + "1";
                            }
                            let propertyInfo = new PropertyInfo();
                            propertyInfo.path = path;
                            propertyInfo.typeName = arr.length > 1 ? arr[1] + "." + compName : compName;
                            propertyInfo.pName = pName;
                            list.push(propertyInfo);
                        }
                    }
                } else {
                    let pName = Utils.lowerFirst(prefix);
                    while (true) {
                        var find = list.find(v => v.pName == pName);
                        if (find == null) break;
                        else pName = pName + "1";
                    }
                    let propertyInfo = new PropertyInfo();
                    propertyInfo.path = path;
                    propertyInfo.typeName = null;
                    propertyInfo.pName = pName;
                    list.push(propertyInfo);
                }

            }
        }
        return list;
    }

    private getNodePath(n: Node) {
        if (!EDITOR) return;
        let arr: string[] = [];
        while (n) {
            arr.push(n.name);
            n = n.parent;
            if (n.getComponent(AutoBindProperty)) break;
        }
        return arr.reverse().join("/");
    }

    private getCompName(c: Component) {
        if (!EDITOR) return;
        let name = Utils.trim(/<.+>/.exec(c.name)[0], "<", ">");
        return name;
    }

    //#endregion
}

const CompNameMap = {
    Label: "Lbl|cc",
    Button: "Btn|cc",
    Sprite: "Sp|cc",
    UITransform: "Tf|cc",
    Animation: "Anim|cc",
    EditBox: "Eb|cc",
    Layout: "Lo|cc",
    PageView: "Page|cc",
    ProgressBar: "Pbar|cc",
    RichText: "Rtxt|cc",
    ScrollView: "Scroll|cc",
    Slider: "Sdr|cc",
    Toggle: "Tog|cc",
    ToggleGroup: "TogG|cc",
    ToggleContainer: "TogC|cc",
    VideoPlayer: "Video|cc",
    WebView: "Web|cc",
    Widget: "Wid|cc",
    Mask: "Mask|cc",
    Graphics: "Graph|cc",
    ParticleSystem2D: "P2d|cc",
    TiledMap: "Tmap|cc",
    Skeleton: "Sk|sp",
    Switch: "Sw",
}

class PropertyInfo {
    public path: string;
    public typeName: string;
    public pName: string;
}