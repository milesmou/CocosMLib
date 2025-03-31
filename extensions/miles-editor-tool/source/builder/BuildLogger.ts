import { ipcRenderer } from "electron";
import { Logger } from "../tools/Logger";

/** 在主进程打印日志 */
export class BuildLogger {
    public static info(...data: any[]) {
        if (typeof ipcRenderer === "undefined") {
            Logger.info(...data);
        } else {
            ipcRenderer.send("Logger.info", ...data);
        }
    }

    public static warn(...data: any[]) {
        if (typeof ipcRenderer === "undefined") {
            Logger.warn(...data);
        } else {
            ipcRenderer.send("Logger.warn", ...data);
        }
    }

    public static error(...data: any[]) {
        if (typeof ipcRenderer === "undefined") {
            Logger.error(...data);
        } else {
            ipcRenderer.send("Logger.error", ...data);
        }
    }
}