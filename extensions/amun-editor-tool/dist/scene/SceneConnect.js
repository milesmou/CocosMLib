"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneConnect = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const Constant_1 = require("../tools/Constant");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmVDb25uZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3NjZW5lL1NjZW5lQ29ubmVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx3REFBMEI7QUFDMUIsZ0RBQTZDO0FBRTdDLE1BQWEsWUFBWTtJQUNkLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBYyxFQUFFLEdBQUcsSUFBVztRQUM3QyxJQUFJLEdBQVEsQ0FBQztRQUNiLElBQUk7WUFDQSxHQUFHLEdBQUcsa0JBQUUsQ0FBQyxZQUFZLENBQUMsbUJBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1NBQ3hEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixHQUFHLEdBQUcsRUFBRSxDQUFDO1NBQ1o7UUFDRCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ25CLGtCQUFFLENBQUMsYUFBYSxDQUFDLG1CQUFRLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDekQsQ0FBQztDQUNKO0FBWEQsb0NBV0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSBcImZzLWV4dHJhXCI7XG5pbXBvcnQgeyBDb25zdGFudCB9IGZyb20gXCIuLi90b29scy9Db25zdGFudFwiO1xuXG5leHBvcnQgY2xhc3MgU2NlbmVDb25uZWN0IHtcbiAgICBwdWJsaWMgc3RhdGljIHNlbmQobWV0aG9kOiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgIGxldCBvYmo6IGFueTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG9iaiA9IGZzLnJlYWRKU09OU3luYyhDb25zdGFudC5TY2VuZUNvbm5lY3RGaWxlUGF0aCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIG9iaiA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIG9ialttZXRob2RdID0gYXJncztcbiAgICAgICAgZnMud3JpdGVKU09OU3luYyhDb25zdGFudC5TY2VuZUNvbm5lY3RGaWxlUGF0aCwgb2JqKTtcbiAgICB9XG59Il19