"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildLogger = void 0;
const electron_1 = require("electron");
const Logger_1 = require("../tools/Logger");
/** 在主进程打印日志 */
class BuildLogger {
    static info(...data) {
        if (typeof electron_1.ipcRenderer === "undefined") {
            Logger_1.Logger.info(...data);
        }
        else {
            electron_1.ipcRenderer.send("Logger.info", ...data);
        }
    }
    static warn(...data) {
        if (typeof electron_1.ipcRenderer === "undefined") {
            Logger_1.Logger.warn(...data);
        }
        else {
            electron_1.ipcRenderer.send("Logger.warn", ...data);
        }
    }
    static error(...data) {
        if (typeof electron_1.ipcRenderer === "undefined") {
            Logger_1.Logger.error(...data);
        }
        else {
            electron_1.ipcRenderer.send("Logger.error", ...data);
        }
    }
}
exports.BuildLogger = BuildLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRMb2dnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zb3VyY2UvYnVpbGRlci9CdWlsZExvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBdUM7QUFDdkMsNENBQXlDO0FBRXpDLGVBQWU7QUFDZixNQUFhLFdBQVc7SUFDYixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBVztRQUM3QixJQUFJLE9BQU8sc0JBQVcsS0FBSyxXQUFXLEVBQUU7WUFDcEMsZUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ3hCO2FBQU07WUFDSCxzQkFBVyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUM1QztJQUNMLENBQUM7SUFFTSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBVztRQUM3QixJQUFJLE9BQU8sc0JBQVcsS0FBSyxXQUFXLEVBQUU7WUFDcEMsZUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ3hCO2FBQU07WUFDSCxzQkFBVyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUM1QztJQUNMLENBQUM7SUFFTSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBVztRQUM5QixJQUFJLE9BQU8sc0JBQVcsS0FBSyxXQUFXLEVBQUU7WUFDcEMsZUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ3pCO2FBQU07WUFDSCxzQkFBVyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUM3QztJQUNMLENBQUM7Q0FDSjtBQXhCRCxrQ0F3QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpcGNSZW5kZXJlciB9IGZyb20gXCJlbGVjdHJvblwiO1xuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4uL3Rvb2xzL0xvZ2dlclwiO1xuXG4vKiog5Zyo5Li76L+b56iL5omT5Y2w5pel5b+XICovXG5leHBvcnQgY2xhc3MgQnVpbGRMb2dnZXIge1xuICAgIHB1YmxpYyBzdGF0aWMgaW5mbyguLi5kYXRhOiBhbnlbXSkge1xuICAgICAgICBpZiAodHlwZW9mIGlwY1JlbmRlcmVyID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBMb2dnZXIuaW5mbyguLi5kYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmQoXCJMb2dnZXIuaW5mb1wiLCAuLi5kYXRhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgd2FybiguLi5kYXRhOiBhbnlbXSkge1xuICAgICAgICBpZiAodHlwZW9mIGlwY1JlbmRlcmVyID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBMb2dnZXIud2FybiguLi5kYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlwY1JlbmRlcmVyLnNlbmQoXCJMb2dnZXIud2FyblwiLCAuLi5kYXRhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZXJyb3IoLi4uZGF0YTogYW55W10pIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpcGNSZW5kZXJlciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKC4uLmRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXBjUmVuZGVyZXIuc2VuZChcIkxvZ2dlci5lcnJvclwiLCAuLi5kYXRhKTtcbiAgICAgICAgfVxuICAgIH1cbn0iXX0=