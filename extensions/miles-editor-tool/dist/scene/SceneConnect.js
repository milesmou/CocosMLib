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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmVDb25uZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3NjZW5lL1NjZW5lQ29ubmVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx3REFBMEI7QUFDMUIsZ0RBQTZDO0FBRTdDLHFCQUFxQjtBQUNyQixNQUFhLFlBQVk7SUFDZCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQWMsRUFBRSxHQUFHLElBQVc7UUFDN0MsSUFBSSxHQUFRLENBQUM7UUFDYixJQUFJO1lBQ0EsR0FBRyxHQUFHLGtCQUFFLENBQUMsWUFBWSxDQUFDLG1CQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQztTQUN4RDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsR0FBRyxHQUFHLEVBQUUsQ0FBQztTQUNaO1FBQ0QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNuQixrQkFBRSxDQUFDLGFBQWEsQ0FBQyxtQkFBUSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3pELENBQUM7Q0FDSjtBQVhELG9DQVdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gXCJmcy1leHRyYVwiO1xuaW1wb3J0IHsgQ29uc3RhbnQgfSBmcm9tIFwiLi4vdG9vbHMvQ29uc3RhbnRcIjtcblxuLyoqIOmAmui/h+aWh+S7tuWSjFNjZW5l5omp5bGV6YCa5L+hICovXG5leHBvcnQgY2xhc3MgU2NlbmVDb25uZWN0IHtcbiAgICBwdWJsaWMgc3RhdGljIHNlbmQobWV0aG9kOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgIGxldCBvYmo6IGFueTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG9iaiA9IGZzLnJlYWRKU09OU3luYyhDb25zdGFudC5TY2VuZUNvbm5lY3RGaWxlUGF0aCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIG9iaiA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIG9ialttZXRob2RdID0gYXJncztcbiAgICAgICAgZnMud3JpdGVKU09OU3luYyhDb25zdGFudC5TY2VuZUNvbm5lY3RGaWxlUGF0aCwgb2JqKTtcbiAgICB9XG59Il19