
/** 打印日志  同时保存日志到文件中 */
export class Logger {

    public static info(...data: any[]) {
        let msg = `[${new Date().toLocaleString()}] ${data.join(" ")} \n`;
        console.log(msg)
    }

    public static warn(...data: any[]) {
        let msg = `[${new Date().toLocaleString()}] ${data.join(" ")} \n`;
        console.warn(msg)
    }

    public static error(...data: any[]) {
        let msg = `[${new Date().toLocaleString()}] ${data.join(" ")} \n`;
        console.error(msg)
    }

    

}