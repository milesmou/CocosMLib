import { ipcMain } from "electron";
import { Logger } from "./tools/Logger";

export class EventMain {
    /** 注册事件 */
    public static registerEvent() {
        //注册打印事件(方便无法在编辑器打印消息的进程打印信息)
        ipcMain.on("Logger.info", this.loggerInfoListener);
        ipcMain.on("Logger.warn", this.loggerWarnListener);
        ipcMain.on("Logger.error", this.loggerErrorListener);
    }

    /** 取消事件 */
    public static unegisterEvent() {
        ipcMain.off("Logger.info", this.loggerInfoListener);
        ipcMain.off("Logger.warn", this.loggerWarnListener);
        ipcMain.off("Logger.error", this.loggerErrorListener);
    }


    private static loggerInfoListener(e, ...args) {
        Logger.info(...args);
    }

    private static loggerWarnListener(e, ...args) {
        Logger.warn(...args);
    }

    private static loggerErrorListener(e, ...args) {
        Logger.error(...args);
    }
}