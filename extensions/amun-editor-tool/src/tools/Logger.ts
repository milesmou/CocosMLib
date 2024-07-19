import fs from "fs-extra";

/** 打印日志  同时打印日志到文件中 */
export class Logger {
    private static logFilePath = Editor.Project.path + "/temp/logs/amun-editor-logger.log";

    public static info(...data: any[]) {
        fs.ensureFileSync(this.logFilePath);
        let msg = `[${new Date().toLocaleString()}] [info] ${data.join(" ")} \n`;
        fs.appendFileSync(this.logFilePath, msg)
        console.log(msg)
    }

    public static debug(...data: any[]) {
        fs.ensureFileSync(this.logFilePath);
        let msg = `[${new Date().toLocaleString()}] [debug] ${data.join(" ")} \n`;
        fs.appendFileSync(this.logFilePath, msg)
        console.log(msg)
    }

    public static warn(...data: any[]) {
        fs.ensureFileSync(this.logFilePath);
        let msg = `[${new Date().toLocaleString()}] [warn] ${data.join(" ")} \n`;
        fs.appendFileSync(this.logFilePath, msg)
        console.warn(msg)
    }

    public static error(...data: any[]) {
        fs.ensureFileSync(this.logFilePath);
        let msg = `[${new Date().toLocaleString()}] [error] ${data.join(" ")} \n`;
        fs.appendFileSync(this.logFilePath, msg)
        console.error(msg)
    }
}