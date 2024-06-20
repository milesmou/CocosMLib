"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenProperty = void 0;
const cc_1 = require("cc");
class GenProperty {
    static gen(uuid) {
        var _a;
        console.log("GenProperty uuid22", uuid);
        console.log((_a = cc_1.director.getScene()) === null || _a === void 0 ? void 0 : _a.children.length);
        let node = this.getNodeByUUid(uuid);
        if (node) {
            console.log(node.name);
            let comp = node.getComponent("AutoGenProperty");
            if (comp) {
                console.log("组件招到了");
            }
            else {
                console.warn("节点上未找到继承AutoGenProperty组件的脚本");
            }
        }
        else {
            console.warn("节点未找到");
        }
    }
    /** 获取选中的节点 */
    static getNodeByUUid(uuid) {
        let n = cc_1.director.getScene();
        while (n.children.length > 0) {
            for (const n1 of n.children) {
                if (n1.uuid == uuid)
                    return n1;
            }
        }
        return null;
    }
}
exports.GenProperty = GenProperty;
