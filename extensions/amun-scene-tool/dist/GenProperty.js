"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenProperty = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const cc_1 = require("cc");
const CCUtil_1 = require("./tools/CCUtil");
const Logger_1 = require("./tools/Logger");
const SceneTool_1 = require("./tools/SceneTool");
const Utils_1 = require("./tools/Utils");
class IPropertyInfo {
}
const CCTypes = [
    { name: "cc.UITransform", typeName: "cc.UITransform", shortName: "Tf" },
    { name: "cc.Label", typeName: "cc.Label", shortName: "Lbl" },
    { name: "cc.Sprite", typeName: "cc.Sprite", shortName: "Sp" },
    { name: "cc.Button", typeName: "cc.Button", shortName: "Btn" },
    { name: "MButton", typeName: "MButton", shortName: "Btn" },
    { name: "cc.Animation", typeName: "cc.Animation", shortName: "Anim" },
    { name: "cc.EditBox", typeName: "cc.EditBox", shortName: "Eb" },
    { name: "cc.Layout", typeName: "cc.Layout", shortName: "La" },
    { name: "cc.ProgressBar", typeName: "cc.ProgressBar", shortName: "PBar" },
    { name: "cc.PageView", typeName: "cc.PageView", shortName: "PV" },
    { name: "cc.RichText", typeName: "cc.RichText", shortName: "Rtxt" },
    { name: "cc.ScrollView", typeName: "cc.ScrollView", shortName: "SV" },
    { name: "cc.Slider", typeName: "cc.Slider", shortName: "Sli" },
    { name: "cc.Toggle", typeName: "cc.Toggle", shortName: "Tog" },
    { name: "MToggle", typeName: "MToggle", shortName: "Tog" },
    { name: "cc.ToggleContainer", typeName: "cc.ToggleContainer", shortName: "TC" },
    { name: "cc.VideoPlayer", typeName: "cc.VideoPlayer", shortName: "VP" },
    { name: "cc.WebView", typeName: "cc.WebView", shortName: "WV" },
    { name: "cc.Widget", typeName: "cc.Widget", shortName: "Wid" },
    { name: "cc.Mask", typeName: "cc.Mask", shortName: "Mask" },
    { name: "cc.Graphics", typeName: "cc.Graphics", shortName: "Gra" },
    { name: "cc.ParticleSystem2D", typeName: "cc.ParticleSystem2D", shortName: "PS2" },
    { name: "cc.TiledMap", typeName: "cc.TiledMap", shortName: "TM" },
    { name: "sp.Skeleton", typeName: "cc.sp.Skeleton", shortName: "Ske" },
];
class GenProperty {
    static gen(uuid) {
        let node = SceneTool_1.SceneTool.getNodeByUUid(uuid);
        if (node) {
            let comp = node.getComponent(this.compName);
            if (comp) {
                this.genPropertyTSFile(comp);
            }
            else {
                Logger_1.Logger.warn("节点上未找到继承GenProperty组件的脚本");
            }
        }
        else {
            Logger_1.Logger.warn("节点未找到");
        }
    }
    static genPropertyTSFile(comp) {
        let className = cc_1.js.getClassName(comp) + "Property";
        let outDir = Utils_1.Utils.ProjectPath + `/assets/scripts/gen/property`;
        fs_extra_1.default.ensureDirSync(outDir);
        let outFile = Utils_1.Utils.ProjectPath + `/assets/scripts/gen/property/${className}.ts`;
        let content = "";
        content += `import * as cc from "cc";\n`;
        content += `import { MButton } from "../../../mlib/module/ui/extend/MButton";\n`;
        content += `import { MToggle } from "../../../mlib/module/ui/extend/MToggle";\n`;
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
        fs_extra_1.default.writeFileSync(outFile, content);
        Utils_1.Utils.refreshAsset(outFile);
        Logger_1.Logger.info(`生成${className}成功`);
    }
    static getNodePath(n) {
        let arr = [];
        while (n) {
            arr.push(n.name);
            n = n.parent;
            if (n.getComponent(this.compName))
                break;
        }
        return arr.reverse().join("/");
    }
    static getAutoBindRootNode(n) {
        return CCUtil_1.CCUtils.getComponentInParent(n, this.compName).node;
    }
    static getAllChilds(root) {
        let arr = [];
        let checkArr = [...root.children];
        arr.push(...checkArr);
        while (checkArr.length > 0) {
            let v = checkArr.shift();
            if (v.getComponent(this.compName))
                continue;
            if (v.children.length > 0) {
                checkArr.push(...v.children);
                arr.push(...v.children);
            }
        }
        return arr;
    }
    static getPropertyInfo(root) {
        let list = [];
        let arr = this.getAllChilds(root);
        for (const node of arr) {
            if (node.name.startsWith(this.prefix)) {
                if (this.getAutoBindRootNode(node) != root)
                    continue;
                let path = this.getNodePath(node);
                let prefix = node.name.replace(this.prefix, "");
                prefix = prefix.replace(/[^_a-zA-Z0-9]/g, "");
                let comps = this.getVaildComponents(node.components);
                if (comps.length > 0) {
                    for (const comp of comps) {
                        let compName = cc_1.js.getClassName(comp);
                        let cctype = CCTypes.find(v => v.name == compName);
                        if (cctype) {
                            let pName = Utils_1.Utils.lowerFirst(prefix) + cctype.shortName;
                            while (true) {
                                var find = list.find(v => v.pName == pName);
                                if (find == null)
                                    break;
                                else
                                    pName = pName + "1";
                            }
                            let propertyInfo = {};
                            propertyInfo.path = path;
                            propertyInfo.typeName = cctype.typeName;
                            propertyInfo.pName = pName;
                            list.push(propertyInfo);
                        }
                    }
                }
                else {
                    let pName = Utils_1.Utils.lowerFirst(prefix);
                    while (true) {
                        var find = list.find(v => v.pName == pName);
                        if (find == null)
                            break;
                        else
                            pName = pName + "1";
                    }
                    let propertyInfo = {};
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
    static getVaildComponents(comps) {
        let result = [];
        for (const comp of comps) {
            let compName = cc_1.js.getClassName(comp);
            let cctype = CCTypes.find(v => v.name == compName);
            if (cctype)
                result.push(comp);
        }
        return result;
    }
}
exports.GenProperty = GenProperty;
GenProperty.compName = "GenProperty";
GenProperty.prefix = "$";
