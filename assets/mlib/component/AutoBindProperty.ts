import { Component, Node, _decorator, log } from "cc";
import { CCUtils } from "../utils/CCUtil";
import { Utils } from "../utils/Utils";
import { EDITOR } from "cc/env";

const { ccclass, executeInEditMode } = _decorator;

/** 自动绑定字段的脚本 需配合插件一起使用 */
@ccclass('AutoBindProperty')
@executeInEditMode
export class AutoBindProperty extends Component {

    private autoBindCompCache: { [key: string]: Component } = {}
    private autoBindNodeCache: { [path: string]: Node } = {}

    getAutoBindComp<T extends Component>(path: string, type: { new(): T }) {
        let key = `${type.name}+${path}`;
        if (this.autoBindCompCache[key]?.isValid) return this.autoBindCompCache[key];

        if (this.autoBindNodeCache[path]?.isValid) {
            return this.autoBindNodeCache[path].getComponent(type);
        } else {
            let comp = CCUtils.getComponentAtPath(this.node, path, type);
            if (comp?.isValid) {
                this.autoBindCompCache[key] = comp;
                this.autoBindNodeCache[path] = comp.node;
            }
            console.error(`[${this.node.name}]节点指定路径未找到组件 ${key}`);

            return comp;
        }
    }

    /** 调用当前节点上其它组件的方法 */
    sendMessage(methodName: string, ...args: any[]) {
        methodName = methodName.trim();
        for (const comp of this.node.components) {
            if (comp[methodName] && typeof comp[methodName] === "function") {
                (comp[methodName] as Function).apply(comp, args);
                return;
            }
        }
        console.warn(`节点上未找到指定方法 ${methodName} ${CCUtils.GetNodePath(this.node)}`);
    }

    /** 调用祖先节点上组件的方法 */
    sendMessageUpwards(methodName: string, ...args: any[]) {
        let node = this.node.parent;
        while (node?.isValid) {
            for (const comp of node.components) {
                if (comp[methodName] && typeof comp[methodName] === "function") {
                    (comp[methodName] as Function).apply(comp, args);
                    return;
                }
            }
            node = node.parent;
        }
        console.warn(`祖先节点上未找到指定方法 ${methodName} ${CCUtils.GetNodePath(this.node)}`);
    }


    protected onDestroy(): void {
        if (!EDITOR) return;
        this.scriptName = this.getCompName(this);
        log("hahha="+this.scriptName)
        this.checkAutoBind();
    }

    //#region 自定绑定属性代码

    private prefix = "bp_";
    private scriptName: string = "";

    private checkAutoBind() {
        if (!EDITOR) return;
        let str1 = "    //gen property start don't modify this area";
        let arr: string[] = [];
        let list = this.getPropertyInfo();
        for (const v of list) {
            let str = `    get ${v.pName}(){ return this.getAutoBindComp("${v.path}", ${v.typeName}); }`;
            arr.push(str);
        }
        let str2 = "    //gen property end don't modify this area ";
        Editor.Message.send("miles-editor-tool", "autoBind", this.scriptName, str1, str2, arr);
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
            let v = checkArr[0];
            checkArr.splice(0, 1);
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
                for (const comp of comps) {
                    let compName = this.getCompName(comp);
                    if (CompNameMap[compName]) {
                        let pName = Utils.lowerFirst(prefix) + CompNameMap[compName];
                        while (true) {
                            var find = list.find(v => v.pName == pName);
                            if (find == null) break;
                            else pName = pName + "1";
                        }
                        let propertyInfo = new PropertyInfo();
                        propertyInfo.path = path;
                        propertyInfo.typeName = compName;
                        propertyInfo.pName = pName;
                        list.push(propertyInfo);
                    }
                }
            }
        }
        return list;
    }

    private getNodePath(n: Node) {
        if (!EDITOR) return;
        let path = CCUtils.GetNodePath(n);
        let tag = "/" + this.scriptName + "/";
        return path.substring(path.indexOf(tag) + tag.length);
    }

    private getCompName(c: Component) {
        if (!EDITOR) return;
        let name = Utils.trim(/<.+>/.exec(c.name)[0], "<", ">");
        return name;
    }

    //#endregion
}

const CompNameMap = {
    Label: "Lbl",
    Button: "Btn",
    Sprite: "Sp",
    UITransform: "Tf",
    EditBox: "Eb",
    Layout: "Lo",
    PageView: "Page",
    ProgressBar: "Pbar",
    RichText: "Rtxt",
    ScrollView: "Scroll",
    Slider: "Sdr",
    Toggle: "Tog",
    ToggleGroup: "TogG",
    VideoPlayer: "Video",
    WebView: "Web",
    Widget: "Wid",
    Mask: "Mask",
    Graphics: "Graph",
    ParticleSystem2D: "P2d",
    TiledMap: "Tmap",
}

class PropertyInfo {
    public path: string;
    public typeName: string;
    public pName: string;
}

//gen property start don't modify this area
//get hahha(){ return this.getAutoBindComp("showTipBox/Label", Label); }
//gen property end don't modify this area