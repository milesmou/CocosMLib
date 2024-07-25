"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const Constant_1 = require("./Constant");
/** 打印日志  同时保存日志到文件中 */
class Logger {
    static info(...data) {
        fs_extra_1.default.ensureFileSync(Constant_1.Constant.LogFilePath);
        let msg = `[${new Date().toLocaleString()}] [info] ${data.join(" ")} \n`;
        fs_extra_1.default.appendFileSync(Constant_1.Constant.LogFilePath, msg);
        console.log(msg);
    }
    static debug(...data) {
        fs_extra_1.default.ensureFileSync(Constant_1.Constant.LogFilePath);
        let msg = `[${new Date().toLocaleString()}] [debug] ${data.join(" ")} \n`;
        fs_extra_1.default.appendFileSync(Constant_1.Constant.LogFilePath, msg);
        console.log(msg);
    }
    static warn(...data) {
        fs_extra_1.default.ensureFileSync(Constant_1.Constant.LogFilePath);
        let msg = `[${new Date().toLocaleString()}] [warn] ${data.join(" ")} \n`;
        fs_extra_1.default.appendFileSync(Constant_1.Constant.LogFilePath, msg);
        console.warn(msg);
    }
    static error(...data) {
        fs_extra_1.default.ensureFileSync(Constant_1.Constant.LogFilePath);
        let msg = `[${new Date().toLocaleString()}] [error] ${data.join(" ")} \n`;
        fs_extra_1.default.appendFileSync(Constant_1.Constant.LogFilePath, msg);
        console.error(msg);
    }
}
exports.Logger = Logger;
