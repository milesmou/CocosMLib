import fs from "fs-extra";

/** 由于构建过程中无法打印日志到控制台 所以暂时打印日志到文件中 */
export class LogToFile {
    private static logFilePath = Editor.Project.path + "/temp/logs/amun-editor-logger.log";

    public static log(...data: any[]) {
        fs.ensureFileSync(this.logFilePath);
        fs.appendFileSync(this.logFilePath, `[${new Date().toLocaleString()}] ${data.join(" ")} \n`)
        console.log(`[${new Date().toLocaleString()}] ${data.join(" ")} \n`)
    }
}