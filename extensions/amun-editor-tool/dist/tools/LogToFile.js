"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
/** 打印日志  同时打印日志到文件中 */
class Logger {
    static log(...data) {
        fs_extra_1.default.ensureFileSync(this.logFilePath);
        fs_extra_1.default.appendFileSync(this.logFilePath, `log [${new Date().toLocaleString()}] ${data.join(" ")} \n`);
        console.log(`[${new Date().toLocaleString()}] ${data.join(" ")} \n`);
    }
    static warn(...data) {
        fs_extra_1.default.ensureFileSync(this.logFilePath);
        fs_extra_1.default.appendFileSync(this.logFilePath, `warn [${new Date().toLocaleString()}] ${data.join(" ")} \n`);
        console.warn(`[${new Date().toLocaleString()}] ${data.join(" ")} \n`);
    }
    static error(...data) {
        fs_extra_1.default.ensureFileSync(this.logFilePath);
        fs_extra_1.default.appendFileSync(this.logFilePath, `error [${new Date().toLocaleString()}] ${data.join(" ")} \n`);
        console.error(`[${new Date().toLocaleString()}] ${data.join(" ")} \n`);
    }
}
Logger.logFilePath = Editor.Project.path + "/temp/logs/amun-editor-logger.log";
//@ts-ignore
globalThis['logger'] = Logger;
