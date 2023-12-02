"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogToFile = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
/** 由于构建过程中无法打印日志到控制台 所以暂时打印日志到文件中 */
class LogToFile {
    static log(...data) {
        fs_extra_1.default.ensureFileSync(this.logFilePath);
        fs_extra_1.default.appendFileSync(this.logFilePath, `[${new Date().toLocaleString()}] ${data.join(" ")} \n`);
    }
}
exports.LogToFile = LogToFile;
LogToFile.logFilePath = Editor.Project.path + "/temp/logs/miles-editor-logger.log";
