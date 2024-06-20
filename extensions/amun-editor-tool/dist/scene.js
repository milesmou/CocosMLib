"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = exports.unload = exports.load = void 0;
const path_1 = require("path");
// 临时在当前模块增加编辑器内的模块为搜索路径，为了能够正常 require 到 cc 模块，后续版本将优化调用方式
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
const cc_1 = require("cc");
function load() {
    console.log("director", cc_1.director.getScene().children.length);
}
exports.load = load;
;
function unload() { }
exports.unload = unload;
;
exports.methods = {
    autoGenProperty: () => {
        console.log("director", cc_1.director.getScene().children.length);
    },
};
