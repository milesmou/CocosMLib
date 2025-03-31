"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventMain = void 0;
const electron_1 = require("electron");
const Logger_1 = require("./tools/Logger");
class EventMain {
    /** 注册事件 */
    static registerEvent() {
        //注册打印事件(方便无法在编辑器打印消息的进程打印信息)
        electron_1.ipcMain.on("Logger.info", this.loggerInfoListener);
        electron_1.ipcMain.on("Logger.warn", this.loggerWarnListener);
        electron_1.ipcMain.on("Logger.error", this.loggerErrorListener);
    }
    /** 取消事件 */
    static unegisterEvent() {
        electron_1.ipcMain.off("Logger.info", this.loggerInfoListener);
        electron_1.ipcMain.off("Logger.warn", this.loggerWarnListener);
        electron_1.ipcMain.off("Logger.error", this.loggerErrorListener);
    }
    static loggerInfoListener(e, ...args) {
        Logger_1.Logger.info(...args);
    }
    static loggerWarnListener(e, ...args) {
        Logger_1.Logger.warn(...args);
    }
    static loggerErrorListener(e, ...args) {
        Logger_1.Logger.error(...args);
    }
}
exports.EventMain = EventMain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRNYWluLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc291cmNlL0V2ZW50TWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBbUM7QUFDbkMsMkNBQXdDO0FBRXhDLE1BQWEsU0FBUztJQUNsQixXQUFXO0lBQ0osTUFBTSxDQUFDLGFBQWE7UUFDdkIsNkJBQTZCO1FBQzdCLGtCQUFPLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNuRCxrQkFBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDbkQsa0JBQU8sQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxXQUFXO0lBQ0osTUFBTSxDQUFDLGNBQWM7UUFDeEIsa0JBQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3BELGtCQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNwRCxrQkFBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUdPLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJO1FBQ3hDLGVBQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRU8sTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxHQUFHLElBQUk7UUFDeEMsZUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFTyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSTtRQUN6QyxlQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBNUJELDhCQTRCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlwY01haW4gfSBmcm9tIFwiZWxlY3Ryb25cIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuL3Rvb2xzL0xvZ2dlclwiO1xuXG5leHBvcnQgY2xhc3MgRXZlbnRNYWluIHtcbiAgICAvKiog5rOo5YaM5LqL5Lu2ICovXG4gICAgcHVibGljIHN0YXRpYyByZWdpc3RlckV2ZW50KCkge1xuICAgICAgICAvL+azqOWGjOaJk+WNsOS6i+S7tijmlrnkvr/ml6Dms5XlnKjnvJbovpHlmajmiZPljbDmtojmga/nmoTov5vnqIvmiZPljbDkv6Hmga8pXG4gICAgICAgIGlwY01haW4ub24oXCJMb2dnZXIuaW5mb1wiLCB0aGlzLmxvZ2dlckluZm9MaXN0ZW5lcik7XG4gICAgICAgIGlwY01haW4ub24oXCJMb2dnZXIud2FyblwiLCB0aGlzLmxvZ2dlcldhcm5MaXN0ZW5lcik7XG4gICAgICAgIGlwY01haW4ub24oXCJMb2dnZXIuZXJyb3JcIiwgdGhpcy5sb2dnZXJFcnJvckxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICAvKiog5Y+W5raI5LqL5Lu2ICovXG4gICAgcHVibGljIHN0YXRpYyB1bmVnaXN0ZXJFdmVudCgpIHtcbiAgICAgICAgaXBjTWFpbi5vZmYoXCJMb2dnZXIuaW5mb1wiLCB0aGlzLmxvZ2dlckluZm9MaXN0ZW5lcik7XG4gICAgICAgIGlwY01haW4ub2ZmKFwiTG9nZ2VyLndhcm5cIiwgdGhpcy5sb2dnZXJXYXJuTGlzdGVuZXIpO1xuICAgICAgICBpcGNNYWluLm9mZihcIkxvZ2dlci5lcnJvclwiLCB0aGlzLmxvZ2dlckVycm9yTGlzdGVuZXIpO1xuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgbG9nZ2VySW5mb0xpc3RlbmVyKGUsIC4uLmFyZ3MpIHtcbiAgICAgICAgTG9nZ2VyLmluZm8oLi4uYXJncyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgbG9nZ2VyV2Fybkxpc3RlbmVyKGUsIC4uLmFyZ3MpIHtcbiAgICAgICAgTG9nZ2VyLndhcm4oLi4uYXJncyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgbG9nZ2VyRXJyb3JMaXN0ZW5lcihlLCAuLi5hcmdzKSB7XG4gICAgICAgIExvZ2dlci5lcnJvciguLi5hcmdzKTtcbiAgICB9XG59Il19