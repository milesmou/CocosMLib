"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildTemplate = void 0;
const Config_1 = require("../tools/Config");
const Constant_1 = require("../tools/Constant");
/** 拷贝自定义构建模板资源 */
class BuildTemplate {
    static copy(options, result) {
        if (!Config_1.Config.get(Constant_1.Constant.BuildTemplateSaveKey, false))
            return; //未启用构建模板
    }
}
exports.BuildTemplate = BuildTemplate;
