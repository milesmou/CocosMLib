"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotUpdate = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const LogToFile_1 = require("../tools/LogToFile");
const Utils_1 = require("../tools/Utils");
/** 原生平台检查构建配置和修改main.js */
class HotUpdate {
    static modifyMainJs(options, result) {
        if (Utils_1.Utils.isNative(options.platform)) {
            if (options.md5Cache) {
                LogToFile_1.LogToFile.log("若使用热更请关闭md5Cache");
                return;
            }
            let url = path_1.default.join(result.dest, 'data', 'main.js');
            if (!fs_extra_1.default.existsSync(url)) {
                url = path_1.default.join(result.dest, 'assets', 'main.js');
            }
            let;
        }
    }
}
exports.HotUpdate = HotUpdate;
