"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneConnect = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const Constant_1 = require("../tools/Constant");
/** 通过文件和Scene扩展通信 */
class SceneConnect {
    static send(method, ...args) {
        let obj;
        try {
            obj = fs_extra_1.default.readJSONSync(Constant_1.Constant.SceneConnectFilePath);
        }
        catch (e) {
            obj = {};
        }
        obj[method] = args;
        fs_extra_1.default.writeJSONSync(Constant_1.Constant.SceneConnectFilePath, obj);
    }
}
exports.SceneConnect = SceneConnect;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmVDb25uZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3NjZW5lL1NjZW5lQ29ubmVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx3REFBMEI7QUFDMUIsZ0RBQTZDO0FBQzdDLHFCQUFxQjtBQUNyQixNQUFhLFlBQVk7SUFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQWMsRUFBRSxHQUFHLElBQVc7UUFDN0MsSUFBSSxHQUFRLENBQUM7UUFDYixJQUFJO1lBQ0EsR0FBRyxHQUFHLGtCQUFFLENBQUMsWUFBWSxDQUFDLG1CQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQztTQUN4RDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsR0FBRyxHQUFHLEVBQUUsQ0FBQztTQUNaO1FBQ0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNuQixrQkFBRSxDQUFDLGFBQWEsQ0FBQyxtQkFBUSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3pELENBQUM7Q0FDSjtBQVhELG9DQVdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gXCJmcy1leHRyYVwiO1xuaW1wb3J0IHsgQ29uc3RhbnQgfSBmcm9tIFwiLi4vdG9vbHMvQ29uc3RhbnRcIjtcbi8qKiDpgJrov4fmlofku7blkoxTY2VuZeaJqeWxlemAmuS/oSAqL1xuZXhwb3J0IGNsYXNzIFNjZW5lQ29ubmVjdCB7XG4gICAgcHVibGljIHN0YXRpYyBzZW5kKG1ldGhvZDogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkge1xuICAgICAgICBsZXQgb2JqOiBhbnk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBvYmogPSBmcy5yZWFkSlNPTlN5bmMoQ29uc3RhbnQuU2NlbmVDb25uZWN0RmlsZVBhdGgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBvYmogPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBvYmpbbWV0aG9kXSA9IGFyZ3M7XG4gICAgICAgIGZzLndyaXRlSlNPTlN5bmMoQ29uc3RhbnQuU2NlbmVDb25uZWN0RmlsZVBhdGgsIG9iaik7XG4gICAgfVxufSJdfQ==