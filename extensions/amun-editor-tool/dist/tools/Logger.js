"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
/** 打印日志  同时打印日志到文件中 */
class Logger {
    static info(...data) {
        fs_extra_1.default.ensureFileSync(this.logFilePath);
        let msg = `[${new Date().toLocaleString()}] [info] ${data.join(" ")} \n`;
        fs_extra_1.default.appendFileSync(this.logFilePath, msg);
        console.log(msg);
    }
    static debug(...data) {
        fs_extra_1.default.ensureFileSync(this.logFilePath);
        let msg = `[${new Date().toLocaleString()}] [debug] ${data.join(" ")} \n`;
        fs_extra_1.default.appendFileSync(this.logFilePath, msg);
        console.log(msg);
    }
    static warn(...data) {
        fs_extra_1.default.ensureFileSync(this.logFilePath);
        let msg = `[${new Date().toLocaleString()}] [warn] ${data.join(" ")} \n`;
        fs_extra_1.default.appendFileSync(this.logFilePath, msg);
        console.warn(msg);
    }
    static error(...data) {
        fs_extra_1.default.ensureFileSync(this.logFilePath);
        let msg = `[${new Date().toLocaleString()}] [error] ${data.join(" ")} \n`;
        fs_extra_1.default.appendFileSync(this.logFilePath, msg);
        console.error(msg);
    }
}
exports.Logger = Logger;
Logger.logFilePath = Editor.Project.path + "/temp/logs/amun-editor-logger.log";
