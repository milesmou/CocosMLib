// import { _decorator } from "cc";
// import { CCUtils } from "../utils/CCUtil";
// import { UIBase } from "../module/ui/manager/UIBase";
// import { AutoBindProperty } from "../module/ui/AutoBindProperty";

// const { property, ccclass, requireComponent } = _decorator;

// @ccclass("UIItem")
// export class UIItem extends AutoBindProperty {
//     /** 调用节点所属UI组件的方法 */
//     protected sendMessageToUI(methodName: string, ...args: any[]) {
//         let ui = CCUtils.getComponentInParent(this.node, UIBase);
//         if (ui?.isValid) {
//             if (ui[methodName] && typeof ui[methodName] === "function") {
//                 (ui[methodName] as Function).apply(ui, args);
//                 return;
//             }
//         }
//         console.warn(`节点所属UI组件未找到指定方法 ${methodName} ${CCUtils.getNodePath(this.node)}`);
//     }
// }

