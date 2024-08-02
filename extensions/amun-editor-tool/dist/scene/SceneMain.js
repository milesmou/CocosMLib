"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
// 临时在当前模块增加编辑器内的模块为搜索路径，为了能够正常 require 到 cc 模块，后续版本将优化调用方式
const path_1 = require("path");
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
const Constant_1 = require("../tools/Constant");
const Logger_1 = require("../tools/Logger");
const SceneCmdExecute_1 = require("./SceneCmdExecute");
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    replaceComponent: SceneCmdExecute_1.SceneCmdExecute.replaceComponent.bind(SceneCmdExecute_1.SceneCmdExecute)
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
function load() {
    sceneconnectWatcher = fs_extra_1.default.watch(Constant_1.Constant.SceneConnectFilePath, sceneconnectListener);
}
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() {
    sceneconnectWatcher.close();
}
exports.unload = unload;
let sceneconnectWatcher;
let isWork = false;
let workDelay = 100;
function sceneconnectListener(event, filename) {
    if (event != 'change')
        return;
    if (isWork)
        return; //控制处理频率
    isWork = true;
    setTimeout(() => {
        isWork = false;
        try {
            let obj = fs_extra_1.default.readJSONSync(Constant_1.Constant.SceneConnectFilePath);
            if (Object.keys(obj).length == 0)
                return;
            for (const key in obj) {
                let params = obj[key];
                let func = exports.methods[key];
                if (typeof func === "function") {
                    func.apply(this, params);
                }
                else {
                    Logger_1.Logger.error(`${key}方法未在SceneMain的methods中注册`);
                }
            }
            fs_extra_1.default.writeJSONSync(Constant_1.Constant.SceneConnectFilePath, {});
        }
        catch (e) {
            Logger_1.Logger.error(e);
        }
    }, workDelay);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmVNYWluLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3NjZW5lL1NjZW5lTWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx3REFBeUQ7QUFDekQsMkRBQTJEO0FBQzNELCtCQUE0QjtBQUM1QixNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFBLFdBQUksRUFBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO0FBRXpELGdEQUE2QztBQUM3Qyw0Q0FBeUM7QUFDekMsdURBQW9EO0FBR3BEOzs7R0FHRztBQUNVLFFBQUEsT0FBTyxHQUE0QztJQUM1RCxnQkFBZ0IsRUFBRSxpQ0FBZSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxpQ0FBZSxDQUFDO0NBQzNFLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxTQUFnQixJQUFJO0lBQ2hCLG1CQUFtQixHQUFHLGtCQUFFLENBQUMsS0FBSyxDQUFDLG1CQUFRLENBQUMsb0JBQW9CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztBQUN4RixDQUFDO0FBRkQsb0JBRUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixNQUFNO0lBQ2xCLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2hDLENBQUM7QUFGRCx3QkFFQztBQUVELElBQUksbUJBQThCLENBQUM7QUFDbkMsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ25CLElBQUksU0FBUyxHQUFHLEdBQUcsQ0FBQztBQUVwQixTQUFTLG9CQUFvQixDQUFDLEtBQXFCLEVBQUUsUUFBZ0I7SUFDakUsSUFBSSxLQUFLLElBQUksUUFBUTtRQUFFLE9BQU87SUFDOUIsSUFBSSxNQUFNO1FBQUUsT0FBTyxDQUFBLFFBQVE7SUFDM0IsTUFBTSxHQUFHLElBQUksQ0FBQztJQUNkLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWixNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ2YsSUFBSTtZQUNBLElBQUksR0FBRyxHQUFHLGtCQUFFLENBQUMsWUFBWSxDQUFDLG1CQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUN6RCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUM7Z0JBQUUsT0FBTztZQUN6QyxLQUFLLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRTtnQkFDbkIsSUFBSSxNQUFNLEdBQVUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QixJQUFJLElBQUksR0FBRyxlQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3hCLElBQUksT0FBTyxJQUFJLEtBQUssVUFBVSxFQUFFO29CQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztpQkFDNUI7cUJBQU07b0JBQ0gsZUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsMEJBQTBCLENBQUMsQ0FBQztpQkFDbEQ7YUFDSjtZQUNELGtCQUFFLENBQUMsYUFBYSxDQUFDLG1CQUFRLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FFdkQ7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkI7SUFDTCxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDbEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcywgeyBGU1dhdGNoZXIsIFdhdGNoRXZlbnRUeXBlIH0gZnJvbSBcImZzLWV4dHJhXCI7XG4vLyDkuLTml7blnKjlvZPliY3mqKHlnZflop7liqDnvJbovpHlmajlhoXnmoTmqKHlnZfkuLrmkJzntKLot6/lvoTvvIzkuLrkuobog73lpJ/mraPluLggcmVxdWlyZSDliLAgY2Mg5qih5Z2X77yM5ZCO57ut54mI5pys5bCG5LyY5YyW6LCD55So5pa55byPXG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5tb2R1bGUucGF0aHMucHVzaChqb2luKEVkaXRvci5BcHAucGF0aCwgJ25vZGVfbW9kdWxlcycpKTtcblxuaW1wb3J0IHsgQ29uc3RhbnQgfSBmcm9tIFwiLi4vdG9vbHMvQ29uc3RhbnRcIjtcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuLi90b29scy9Mb2dnZXJcIjtcbmltcG9ydCB7IFNjZW5lQ21kRXhlY3V0ZSB9IGZyb20gXCIuL1NjZW5lQ21kRXhlY3V0ZVwiO1xuXG5cbi8qKlxuICogQGVuIFJlZ2lzdHJhdGlvbiBtZXRob2QgZm9yIHRoZSBtYWluIHByb2Nlc3Mgb2YgRXh0ZW5zaW9uXG4gKiBAemgg5Li65omp5bGV55qE5Li76L+b56iL55qE5rOo5YaM5pa55rOVXG4gKi9cbmV4cG9ydCBjb25zdCBtZXRob2RzOiB7IFtrZXk6IHN0cmluZ106ICguLi5hbnk6IGFueSkgPT4gYW55IH0gPSB7XG4gICAgcmVwbGFjZUNvbXBvbmVudDogU2NlbmVDbWRFeGVjdXRlLnJlcGxhY2VDb21wb25lbnQuYmluZChTY2VuZUNtZEV4ZWN1dGUpXG59O1xuXG4vKipcbiAqIEBlbiBIb29rcyB0cmlnZ2VyZWQgYWZ0ZXIgZXh0ZW5zaW9uIGxvYWRpbmcgaXMgY29tcGxldGVcbiAqIEB6aCDmianlsZXliqDovb3lrozmiJDlkI7op6blj5HnmoTpkqnlrZBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWQoKSB7XG4gICAgc2NlbmVjb25uZWN0V2F0Y2hlciA9IGZzLndhdGNoKENvbnN0YW50LlNjZW5lQ29ubmVjdEZpbGVQYXRoLCBzY2VuZWNvbm5lY3RMaXN0ZW5lcik7XG59XG5cbi8qKlxuICogQGVuIEhvb2tzIHRyaWdnZXJlZCBhZnRlciBleHRlbnNpb24gdW5pbnN0YWxsYXRpb24gaXMgY29tcGxldGVcbiAqIEB6aCDmianlsZXljbjovb3lrozmiJDlkI7op6blj5HnmoTpkqnlrZBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVubG9hZCgpIHtcbiAgICBzY2VuZWNvbm5lY3RXYXRjaGVyLmNsb3NlKCk7XG59XG5cbmxldCBzY2VuZWNvbm5lY3RXYXRjaGVyOiBGU1dhdGNoZXI7XG5sZXQgaXNXb3JrID0gZmFsc2U7XG5sZXQgd29ya0RlbGF5ID0gMTAwO1xuXG5mdW5jdGlvbiBzY2VuZWNvbm5lY3RMaXN0ZW5lcihldmVudDogV2F0Y2hFdmVudFR5cGUsIGZpbGVuYW1lOiBzdHJpbmcpIHtcbiAgICBpZiAoZXZlbnQgIT0gJ2NoYW5nZScpIHJldHVybjtcbiAgICBpZiAoaXNXb3JrKSByZXR1cm47Ly/mjqfliLblpITnkIbpopHnjodcbiAgICBpc1dvcmsgPSB0cnVlO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpc1dvcmsgPSBmYWxzZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBvYmogPSBmcy5yZWFkSlNPTlN5bmMoQ29uc3RhbnQuU2NlbmVDb25uZWN0RmlsZVBhdGgpO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09IDApIHJldHVybjtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgICAgICAgICAgICAgIGxldCBwYXJhbXM6IGFueVtdID0gb2JqW2tleV07XG4gICAgICAgICAgICAgICAgbGV0IGZ1bmMgPSBtZXRob2RzW2tleV07XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmdW5jID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZnVuYy5hcHBseSh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIExvZ2dlci5lcnJvcihgJHtrZXl95pa55rOV5pyq5ZyoU2NlbmVNYWlu55qEbWV0aG9kc+S4reazqOWGjGApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZzLndyaXRlSlNPTlN5bmMoQ29uc3RhbnQuU2NlbmVDb25uZWN0RmlsZVBhdGgsIHt9KTtcblxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBMb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgIH1cbiAgICB9LCB3b3JrRGVsYXkpO1xufVxuIl19