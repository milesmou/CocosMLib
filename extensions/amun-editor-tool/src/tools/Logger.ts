import fs from "fs-extra";
import { Constant } from "./Constant";

/** 打印日志  同时打印日志到文件中 */
export class Logger {

    public static info(...data: any[]) {
        fs.ensureFileSync(Constant.LogFilePath);
        let msg = `[${new Date().toLocaleString()}] [info] ${data.join(" ")} \n`;
        fs.appendFileSync(Constant.LogFilePath, msg)
        console.log(msg)
    }

    public static debug(...data: any[]) {
        fs.ensureFileSync(Constant.LogFilePath);
        let msg = `[${new Date().toLocaleString()}] [debug] ${data.join(" ")} \n`;
        fs.appendFileSync(Constant.LogFilePath, msg)
        console.log(msg)
    }

    public static warn(...data: any[]) {
        fs.ensureFileSync(Constant.LogFilePath);
        let msg = `[${new Date().toLocaleString()}] [warn] ${data.join(" ")} \n`;
        fs.appendFileSync(Constant.LogFilePath, msg)
        console.warn(msg)
    }

    public static error(...data: any[]) {
        fs.ensureFileSync(Constant.LogFilePath);
        let msg = `[${new Date().toLocaleString()}] [error] ${data.join(" ")} \n`;
        fs.appendFileSync(Constant.LogFilePath, msg)
        console.error(msg)
    }
}