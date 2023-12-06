import fs from "fs-extra";

import { Component, Node, js } from "cc";
import { CCUtils } from "./tools/CCUtil";
import { MLogger } from "./tools/MLogger";
import { SceneTool } from "./tools/SceneTool";
import { Utils } from "./tools/Utils";


interface ICCTypeDefine {
    /** 组件名字 */
    name: string;
    /** 类型完整名字 */
    typeName: string;
    /**  名字简写 */
    shortName: string;
}

class IPropertyInfo {
    /** 组件所在节点路径 */
    public path: string;
    /** 组件类型名字 */
    public typeName: string;
    /** 组件字段名字 */
    public pName: string;
}

const CCTypes: ICCTypeDefine[] = [
    { name: "cc.Label", typeName: "cc.Label", shortName: "Lbl" },
    { name: "cc.Sprite", typeName: "cc.Sprite", shortName: "Sp" },
    { name: "cc.UITransform", typeName: "cc.UITransform", shortName: "Tf" },
    { name: "cc.Animation", typeName: "cc.Animation", shortName: "Anim" },
    { name: "cc.EditBox", typeName: "cc.EditBox", shortName: "Eb" },
    { name: "cc.Layout", typeName: "cc.Layout", shortName: "La" },
    { name: "cc.PageView", typeName: "cc.PageView", shortName: "PV" },
    { name: "cc.RichText", typeName: "cc.RichText", shortName: "Rtxt" },
    { name: "cc.ScrollView", typeName: "cc.ScrollView", shortName: "SV" },
    { name: "cc.Slider", typeName: "cc.Slider", shortName: "Sli" },
    { name: "cc.Toggle", typeName: "cc.Toggle", shortName: "Tog" },
    { name: "cc.ToggleGroup", typeName: "cc.ToggleGroup", shortName: "TG" },
    { name: "cc.VideoPlayer", typeName: "cc.VideoPlayer", shortName: "VP" },
    { name: "cc.WebView", typeName: "cc.WebView", shortName: "WV" },
    { name: "cc.Widget", typeName: "cc.Widget", shortName: "Wid" },
    { name: "cc.Mask", typeName: "cc.Mask", shortName: "Mask" },
    { name: "cc.Graphics", typeName: "cc.Graphics", shortName: "Gra" },
    { name: "cc.ParticleSystem2D", typeName: "cc.ParticleSystem2D", shortName: "PS2" },
    { name: "cc.TiledMap", typeName: "cc.TiledMap", shortName: "TM" },
    { name: "sp.Skeleton", typeName: "cc.sp.Skeleton", shortName: "Ske" },
];

export class GenProperty {

    private static compName = "GenProperty";
    private static prefix = "$";

    public static gen(uuid: string) {
        let node = SceneTool.getNodeByUUid(uuid);
        if (node) {
            let comp = node.getComponent(this.compName);
            if (comp) {
                this.genPropertyTSFile(comp);
            } else {
                MLogger.warn("节点上未找到继承GenProperty组件的脚本");
            }
        } else {
            MLogger.warn("节点未找到");
        }
    }

    private static genPropertyTSFile(comp: Component) {
        let className = js.getClassName(comp) + "Property";
        let outDir = Utils.ProjectPath + `/assets/scripts/gen/property`;
        fs.ensureDirSync(outDir);
        let outFile = Utils.ProjectPath + `/assets/scripts/gen/property/${className}.ts`;

        let content = "";
        content += `import * as cc from "cc";\n`;
        content += `import { PropertyBase } from "../../../mlib/module/ui/property/PropertyBase";\n`;
        content += `const { ccclass } = cc._decorator;\n`;
        content += `\n`;
        content += `@ccclass('${className}')\n`;
        content += `export class ${className} extends PropertyBase {\n`;

        let list = this.getPropertyInfo(comp.node);
        for (const v of list) {
            if (v.typeName)
                content += `    public get ${v.pName}() { return this.getComp("${v.path}", ${v.typeName}); }\n`;
            else
                content += `    public get ${v.pName}() { return this.getNode("${v.path}"); }\n`;
        }
        content += `}`;
        fs.writeFileSync(outFile, content);
        Utils.refreshAsset(outFile);
        MLogger.info(`生成${className}成功`);
    }


    private static getNodePath(n: Node) {
        let arr: string[] = [];
        while (n) {
            arr.push(n.name);
            n = n.parent;
            if (n.getComponent(this.compName)) break;
        }
        return arr.reverse().join("/");
    }

    private static getAutoBindRootNode(n: Node) {
        return CCUtils.getComponentInParent(n, this.compName).node;
    }

    private static getAllChilds(root: Node) {
        let arr: Node[] = [];
        let checkArr = [...root.children];
        arr.push(...checkArr);
        while (checkArr.length > 0) {
            let v = checkArr.shift();
            if (v.getComponent(this.compName)) continue;
            if (v.children.length > 0) {
                checkArr.push(...v.children);
                arr.push(...v.children);
            }
        }
        return arr;
    }

    private static getPropertyInfo(root: Node) {
        let list: IPropertyInfo[] = [];
        let arr = this.getAllChilds(root);
        for (const node of arr) {
            if (node.name.startsWith(this.prefix)) {
                if (this.getAutoBindRootNode(node) != root) continue;
                let path = this.getNodePath(node);
                let prefix = node.name.replace(this.prefix, "");
                prefix = prefix.replace(/[^_a-zA-Z0-9]/g, "");
                let comps = this.getVaildComponents(node.components);
                if (comps.length > 0) {
                    for (const comp of comps) {
                        let compName = js.getClassName(comp);
                        let cctype = CCTypes.find(v => v.name == compName);
                        if (cctype) {
                            let pName = Utils.lowerFirst(prefix) + cctype.shortName;
                            while (true) {
                                var find = list.find(v => v.pName == pName);
                                if (find == null) break;
                                else pName = pName + "1";
                            }
                            let propertyInfo: IPropertyInfo = {} as any;
                            propertyInfo.path = path;
                            propertyInfo.typeName = cctype.typeName;
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
                    let propertyInfo = {} as any;
                    propertyInfo.path = path;
                    propertyInfo.typeName = null;
                    propertyInfo.pName = pName;
                    list.push(propertyInfo);
                }

            }
        }
        return list;
    }

    /** 筛选出有效的组件 */
    private static getVaildComponents(comps: readonly Component[]) {
        let result: Component[] = [];
        for (const comp of comps) {
            let compName = js.getClassName(comp);
            let cctype = CCTypes.find(v => v.name == compName);
            if (cctype) result.push(comp);
        }
        return result;
    }
}