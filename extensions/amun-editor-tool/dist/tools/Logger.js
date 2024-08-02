"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const Constant_1 = require("./Constant");
/** 打印日志  同时保存日志到文件中 */
class Logger {
    static info(...data) {
        fs_extra_1.default.ensureFileSync(Constant_1.Constant.LogFilePath);
        let msg = `[${new Date().toLocaleString()}] [info] ${data.join(" ")} \n`;
        fs_extra_1.default.appendFileSync(Constant_1.Constant.LogFilePath, msg);
        console.log(msg);
    }
    static debug(...data) {
        fs_extra_1.default.ensureFileSync(Constant_1.Constant.LogFilePath);
        let msg = `[${new Date().toLocaleString()}] [debug] ${data.join(" ")} \n`;
        fs_extra_1.default.appendFileSync(Constant_1.Constant.LogFilePath, msg);
        console.log(msg);
    }
    static warn(...data) {
        fs_extra_1.default.ensureFileSync(Constant_1.Constant.LogFilePath);
        let msg = `[${new Date().toLocaleString()}] [warn] ${data.join(" ")} \n`;
        fs_extra_1.default.appendFileSync(Constant_1.Constant.LogFilePath, msg);
        console.warn(msg);
    }
    static error(...data) {
        fs_extra_1.default.ensureFileSync(Constant_1.Constant.LogFilePath);
        let msg = `[${new Date().toLocaleString()}] [error] ${data.join(" ")} \n`;
        fs_extra_1.default.appendFileSync(Constant_1.Constant.LogFilePath, msg);
        console.error(msg);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3Rvb2xzL0xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx3REFBMEI7QUFDMUIseUNBQXNDO0FBRXRDLHVCQUF1QjtBQUN2QixNQUFhLE1BQU07SUFFUixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBVztRQUM3QixrQkFBRSxDQUFDLGNBQWMsQ0FBQyxtQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3hDLElBQUksR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxjQUFjLEVBQUUsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDekUsa0JBQUUsQ0FBQyxjQUFjLENBQUMsbUJBQVEsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNwQixDQUFDO0lBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQVc7UUFDOUIsa0JBQUUsQ0FBQyxjQUFjLENBQUMsbUJBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN4QyxJQUFJLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQzFFLGtCQUFFLENBQUMsY0FBYyxDQUFDLG1CQUFRLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDcEIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFXO1FBQzdCLGtCQUFFLENBQUMsY0FBYyxDQUFDLG1CQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDeEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztRQUN6RSxrQkFBRSxDQUFDLGNBQWMsQ0FBQyxtQkFBUSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUM1QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3JCLENBQUM7SUFFTSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBVztRQUM5QixrQkFBRSxDQUFDLGNBQWMsQ0FBQyxtQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3hDLElBQUksR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxjQUFjLEVBQUUsYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDMUUsa0JBQUUsQ0FBQyxjQUFjLENBQUMsbUJBQVEsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDNUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUN0QixDQUFDO0NBQ0o7QUE3QkQsd0JBNkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gXCJmcy1leHRyYVwiO1xuaW1wb3J0IHsgQ29uc3RhbnQgfSBmcm9tIFwiLi9Db25zdGFudFwiO1xuXG4vKiog5omT5Y2w5pel5b+XICDlkIzml7bkv53lrZjml6Xlv5fliLDmlofku7bkuK0gKi9cbmV4cG9ydCBjbGFzcyBMb2dnZXIge1xuXG4gICAgcHVibGljIHN0YXRpYyBpbmZvKC4uLmRhdGE6IGFueVtdKSB7XG4gICAgICAgIGZzLmVuc3VyZUZpbGVTeW5jKENvbnN0YW50LkxvZ0ZpbGVQYXRoKTtcbiAgICAgICAgbGV0IG1zZyA9IGBbJHtuZXcgRGF0ZSgpLnRvTG9jYWxlU3RyaW5nKCl9XSBbaW5mb10gJHtkYXRhLmpvaW4oXCIgXCIpfSBcXG5gO1xuICAgICAgICBmcy5hcHBlbmRGaWxlU3luYyhDb25zdGFudC5Mb2dGaWxlUGF0aCwgbXNnKVxuICAgICAgICBjb25zb2xlLmxvZyhtc2cpXG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBkZWJ1ZyguLi5kYXRhOiBhbnlbXSkge1xuICAgICAgICBmcy5lbnN1cmVGaWxlU3luYyhDb25zdGFudC5Mb2dGaWxlUGF0aCk7XG4gICAgICAgIGxldCBtc2cgPSBgWyR7bmV3IERhdGUoKS50b0xvY2FsZVN0cmluZygpfV0gW2RlYnVnXSAke2RhdGEuam9pbihcIiBcIil9IFxcbmA7XG4gICAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKENvbnN0YW50LkxvZ0ZpbGVQYXRoLCBtc2cpXG4gICAgICAgIGNvbnNvbGUubG9nKG1zZylcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHdhcm4oLi4uZGF0YTogYW55W10pIHtcbiAgICAgICAgZnMuZW5zdXJlRmlsZVN5bmMoQ29uc3RhbnQuTG9nRmlsZVBhdGgpO1xuICAgICAgICBsZXQgbXNnID0gYFske25ldyBEYXRlKCkudG9Mb2NhbGVTdHJpbmcoKX1dIFt3YXJuXSAke2RhdGEuam9pbihcIiBcIil9IFxcbmA7XG4gICAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKENvbnN0YW50LkxvZ0ZpbGVQYXRoLCBtc2cpXG4gICAgICAgIGNvbnNvbGUud2Fybihtc2cpXG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBlcnJvciguLi5kYXRhOiBhbnlbXSkge1xuICAgICAgICBmcy5lbnN1cmVGaWxlU3luYyhDb25zdGFudC5Mb2dGaWxlUGF0aCk7XG4gICAgICAgIGxldCBtc2cgPSBgWyR7bmV3IERhdGUoKS50b0xvY2FsZVN0cmluZygpfV0gW2Vycm9yXSAke2RhdGEuam9pbihcIiBcIil9IFxcbmA7XG4gICAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKENvbnN0YW50LkxvZ0ZpbGVQYXRoLCBtc2cpXG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKVxuICAgIH1cbn0iXX0=