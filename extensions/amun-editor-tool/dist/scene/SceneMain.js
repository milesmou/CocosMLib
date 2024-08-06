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
    if (!fs_extra_1.default.existsSync(Constant_1.Constant.SceneConnectFilePath)) {
        fs_extra_1.default.createFileSync(Constant_1.Constant.SceneConnectFilePath);
        fs_extra_1.default.writeJSONSync(Constant_1.Constant.SceneConnectFilePath, {});
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmVNYWluLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3NjZW5lL1NjZW5lTWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx3REFBeUQ7QUFDekQsMkRBQTJEO0FBQzNELCtCQUE0QjtBQUM1QixNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFBLFdBQUksRUFBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO0FBRXpELGdEQUE2QztBQUM3Qyw0Q0FBeUM7QUFDekMsdURBQW9EO0FBR3BEOzs7R0FHRztBQUNVLFFBQUEsT0FBTyxHQUE0QztJQUM1RCxnQkFBZ0IsRUFBRSxpQ0FBZSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxpQ0FBZSxDQUFDO0NBQzNFLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxTQUFnQixJQUFJO0lBQ2hCLElBQUksQ0FBQyxrQkFBRSxDQUFDLFVBQVUsQ0FBQyxtQkFBUSxDQUFDLG9CQUFvQixDQUFDLEVBQUU7UUFDL0Msa0JBQUUsQ0FBQyxjQUFjLENBQUMsbUJBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ2pELGtCQUFFLENBQUMsYUFBYSxDQUFDLG1CQUFRLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDdkQ7SUFDRCxtQkFBbUIsR0FBRyxrQkFBRSxDQUFDLEtBQUssQ0FBQyxtQkFBUSxDQUFDLG9CQUFvQixFQUFFLG9CQUFvQixDQUFDLENBQUM7QUFDeEYsQ0FBQztBQU5ELG9CQU1DO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsTUFBTTtJQUNsQixtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNoQyxDQUFDO0FBRkQsd0JBRUM7QUFFRCxJQUFJLG1CQUE4QixDQUFDO0FBQ25DLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNuQixJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUM7QUFFcEIsU0FBUyxvQkFBb0IsQ0FBQyxLQUFxQixFQUFFLFFBQWdCO0lBQ2pFLElBQUksS0FBSyxJQUFJLFFBQVE7UUFBRSxPQUFPO0lBQzlCLElBQUksTUFBTTtRQUFFLE9BQU8sQ0FBQSxRQUFRO0lBQzNCLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFDZCxVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNmLElBQUk7WUFDQSxJQUFJLEdBQUcsR0FBRyxrQkFBRSxDQUFDLFlBQVksQ0FBQyxtQkFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDekQsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUFFLE9BQU87WUFDekMsS0FBSyxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUU7Z0JBQ25CLElBQUksTUFBTSxHQUFVLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDN0IsSUFBSSxJQUFJLEdBQUcsZUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QixJQUFJLE9BQU8sSUFBSSxLQUFLLFVBQVUsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7aUJBQzVCO3FCQUFNO29CQUNILGVBQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLDBCQUEwQixDQUFDLENBQUM7aUJBQ2xEO2FBQ0o7WUFDRCxrQkFBRSxDQUFDLGFBQWEsQ0FBQyxtQkFBUSxDQUFDLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBRXZEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ25CO0lBQ0wsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMsIHsgRlNXYXRjaGVyLCBXYXRjaEV2ZW50VHlwZSB9IGZyb20gXCJmcy1leHRyYVwiO1xuLy8g5Li05pe25Zyo5b2T5YmN5qih5Z2X5aKe5Yqg57yW6L6R5Zmo5YaF55qE5qih5Z2X5Li65pCc57Si6Lev5b6E77yM5Li65LqG6IO95aSf5q2j5bi4IHJlcXVpcmUg5YiwIGNjIOaooeWdl++8jOWQjue7reeJiOacrOWwhuS8mOWMluiwg+eUqOaWueW8j1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xubW9kdWxlLnBhdGhzLnB1c2goam9pbihFZGl0b3IuQXBwLnBhdGgsICdub2RlX21vZHVsZXMnKSk7XG5cbmltcG9ydCB7IENvbnN0YW50IH0gZnJvbSBcIi4uL3Rvb2xzL0NvbnN0YW50XCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi4vdG9vbHMvTG9nZ2VyXCI7XG5pbXBvcnQgeyBTY2VuZUNtZEV4ZWN1dGUgfSBmcm9tIFwiLi9TY2VuZUNtZEV4ZWN1dGVcIjtcblxuXG4vKipcbiAqIEBlbiBSZWdpc3RyYXRpb24gbWV0aG9kIGZvciB0aGUgbWFpbiBwcm9jZXNzIG9mIEV4dGVuc2lvblxuICogQHpoIOS4uuaJqeWxleeahOS4u+i/m+eoi+eahOazqOWGjOaWueazlVxuICovXG5leHBvcnQgY29uc3QgbWV0aG9kczogeyBba2V5OiBzdHJpbmddOiAoLi4uYW55OiBhbnkpID0+IGFueSB9ID0ge1xuICAgIHJlcGxhY2VDb21wb25lbnQ6IFNjZW5lQ21kRXhlY3V0ZS5yZXBsYWNlQ29tcG9uZW50LmJpbmQoU2NlbmVDbWRFeGVjdXRlKVxufTtcblxuLyoqXG4gKiBAZW4gSG9va3MgdHJpZ2dlcmVkIGFmdGVyIGV4dGVuc2lvbiBsb2FkaW5nIGlzIGNvbXBsZXRlXG4gKiBAemgg5omp5bGV5Yqg6L295a6M5oiQ5ZCO6Kem5Y+R55qE6ZKp5a2QXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkKCkge1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhDb25zdGFudC5TY2VuZUNvbm5lY3RGaWxlUGF0aCkpIHtcbiAgICAgICAgZnMuY3JlYXRlRmlsZVN5bmMoQ29uc3RhbnQuU2NlbmVDb25uZWN0RmlsZVBhdGgpO1xuICAgICAgICBmcy53cml0ZUpTT05TeW5jKENvbnN0YW50LlNjZW5lQ29ubmVjdEZpbGVQYXRoLCB7fSk7XG4gICAgfVxuICAgIHNjZW5lY29ubmVjdFdhdGNoZXIgPSBmcy53YXRjaChDb25zdGFudC5TY2VuZUNvbm5lY3RGaWxlUGF0aCwgc2NlbmVjb25uZWN0TGlzdGVuZXIpO1xufVxuXG4vKipcbiAqIEBlbiBIb29rcyB0cmlnZ2VyZWQgYWZ0ZXIgZXh0ZW5zaW9uIHVuaW5zdGFsbGF0aW9uIGlzIGNvbXBsZXRlXG4gKiBAemgg5omp5bGV5Y246L295a6M5oiQ5ZCO6Kem5Y+R55qE6ZKp5a2QXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmxvYWQoKSB7XG4gICAgc2NlbmVjb25uZWN0V2F0Y2hlci5jbG9zZSgpO1xufVxuXG5sZXQgc2NlbmVjb25uZWN0V2F0Y2hlcjogRlNXYXRjaGVyO1xubGV0IGlzV29yayA9IGZhbHNlO1xubGV0IHdvcmtEZWxheSA9IDEwMDtcblxuZnVuY3Rpb24gc2NlbmVjb25uZWN0TGlzdGVuZXIoZXZlbnQ6IFdhdGNoRXZlbnRUeXBlLCBmaWxlbmFtZTogc3RyaW5nKSB7XG4gICAgaWYgKGV2ZW50ICE9ICdjaGFuZ2UnKSByZXR1cm47XG4gICAgaWYgKGlzV29yaykgcmV0dXJuOy8v5o6n5Yi25aSE55CG6aKR546HXG4gICAgaXNXb3JrID0gdHJ1ZTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaXNXb3JrID0gZmFsc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgb2JqID0gZnMucmVhZEpTT05TeW5jKENvbnN0YW50LlNjZW5lQ29ubmVjdEZpbGVQYXRoKTtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PSAwKSByZXR1cm47XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICBsZXQgcGFyYW1zOiBhbnlbXSA9IG9ialtrZXldO1xuICAgICAgICAgICAgICAgIGxldCBmdW5jID0gbWV0aG9kc1trZXldO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZnVuYyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGZ1bmMuYXBwbHkodGhpcywgcGFyYW1zKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZXJyb3IoYCR7a2V5feaWueazleacquWcqFNjZW5lTWFpbueahG1ldGhvZHPkuK3ms6jlhoxgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmcy53cml0ZUpTT05TeW5jKENvbnN0YW50LlNjZW5lQ29ubmVjdEZpbGVQYXRoLCB7fSk7XG5cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgTG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICB9XG4gICAgfSwgd29ya0RlbGF5KTtcbn1cbiJdfQ==