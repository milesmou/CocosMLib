"use strict";
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.load = void 0;
function load() {
    console.log("director111", director.getScene().children.length);
}
exports.load = load;
