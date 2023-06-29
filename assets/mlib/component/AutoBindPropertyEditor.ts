import { Component, Node, _decorator } from 'cc';
import { EDITOR } from 'cc/env';
import { CCUtils } from '../utils/CCUtil';
import { Utils } from '../utils/Utils';
import { AutoBindProperty } from './AutoBindProperty';
const { ccclass, property, executeInEditMode } = _decorator;

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

/** 编辑器使用的自动绑定字段的脚本 需配合插件一起使用 */
@ccclass('AutoBindPropertyEditor')
@executeInEditMode
export class AutoBindPropertyEditor extends Component {
    private prefix = "bp_";
    private scriptName: string = "";

    onDestroy() {
        if (!EDITOR) return;
        let abp = this.getComponent(AutoBindProperty);
        if (!abp) {
            console.warn(`${CCUtils.GetNodePath(this.node)} 节点上没有继承AutoBindProperty的脚本`);
            return;
        }
        this.scriptName = this.getCompName(abp);
        this.checkAutoBind();
    }


    private checkAutoBind() {
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
        return CCUtils.getComponentInParent(n, AutoBindPropertyEditor).node;
    }

    private getAllChilds() {
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
        let path = CCUtils.GetNodePath(n);
        let tag = "/" + this.scriptName + "/";
        return path.substring(path.indexOf(tag) + tag.length);
    }

    private getCompName(c: Component) {
        let name = Utils.trim(/<.+>/.exec(c.name)[0], "<", ">");
        return name;
    }

}


