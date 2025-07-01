"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildNative = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const Constant_1 = require("../../tools/Constant");
const Utils_1 = require("../../tools/Utils");
const BuildLogger_1 = require("../BuildLogger");
const tag = "[Native]";
/** 原生平台构建后的处理 */
class BuildNative {
    static execute(options, result) {
        if (!Utils_1.Utils.isNative(options.platform))
            return;
        let buildNativeDir = `${Utils_1.Utils.ProjectPath}/${Constant_1.Constant.BuildNativeDirName}`;
        fs_extra_1.default.ensureDirSync(buildNativeDir);
        this.copyNativeModule(options, result);
        this.modifyNativeProject(options, result);
    }
    static copyNativeModule(options, result) {
        let moduleDir = `${Utils_1.Utils.ProjectPath}/${Constant_1.Constant.BuildNativeDirName}/${options.taskName}`;
        if (!fs_extra_1.default.existsSync(moduleDir)) { //
            let oDir1 = `${Utils_1.Utils.ProjectPath}/native/engine/common`;
            let oDir2 = `${Utils_1.Utils.ProjectPath}/native/engine/${options.platform}`;
            let dDir1 = `${moduleDir}/common`;
            let dDir2 = `${moduleDir}/${options.platform}`;
            fs_extra_1.default.copySync(oDir1, dDir1);
            fs_extra_1.default.copySync(oDir2, dDir2);
            BuildLogger_1.BuildLogger.info(tag, `拷贝原生工程模块到[${Constant_1.Constant.BuildNativeDirName}/${options.taskName}]`);
        }
    }
    /** 修改原生工程，使其引用拷贝后的模块 */
    static modifyNativeProject(options, result) {
        BuildLogger_1.BuildLogger.info(tag, `modifyNativeProject ${options.platform}`);
        let files = this.getModifyFiles(options, result);
        if ((files === null || files === void 0 ? void 0 : files.length) > 0) {
            let nativeDir = `${Constant_1.Constant.BuildNativeDirName}/${options.taskName}/${options.platform}`;
            for (const file of files) {
                BuildLogger_1.BuildLogger.info(tag, `modifyFile ${file}`);
                let content = fs_extra_1.default.readFileSync(file, 'utf8');
                let regex = new RegExp("native/engine/" + options.platform, "g");
                fs_extra_1.default.writeFileSync(file, content.replace(regex, nativeDir), "utf8");
            }
        }
    }
    static getModifyFiles(options, result) {
        switch (options.platform) {
            case "android":
                return [`${Utils_1.Utils.toUniSeparator(result.dest)}/proj/gradle.properties`];
            case "ios":
                return [`${Utils_1.Utils.toUniSeparator(result.dest)}/proj/newcooking.xcodeproj/project.pbxproj`];
            default:
                BuildLogger_1.BuildLogger.info(tag, `未处理的平台`, options.platform);
        }
        return null;
    }
}
exports.BuildNative = BuildNative;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGROYXRpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvYnVpbGRlci9wb3N0YnVpbGQvQnVpbGROYXRpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsd0RBQTBCO0FBRTFCLG1EQUFnRDtBQUNoRCw2Q0FBMEM7QUFDMUMsZ0RBQTZDO0FBRTdDLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQztBQUV2QixpQkFBaUI7QUFDakIsTUFBYSxXQUFXO0lBRWIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUF5QixFQUFFLE1BQW9CO1FBQ2pFLElBQUksQ0FBQyxhQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7WUFBRSxPQUFPO1FBQzlDLElBQUksY0FBYyxHQUFHLEdBQUcsYUFBSyxDQUFDLFdBQVcsSUFBSSxtQkFBUSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDM0Usa0JBQUUsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFTyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBeUIsRUFBRSxNQUFvQjtRQUMzRSxJQUFJLFNBQVMsR0FBRyxHQUFHLGFBQUssQ0FBQyxXQUFXLElBQUksbUJBQVEsQ0FBQyxrQkFBa0IsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDMUYsSUFBSSxDQUFDLGtCQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUMsRUFBRTtZQUM5QixJQUFJLEtBQUssR0FBRyxHQUFHLGFBQUssQ0FBQyxXQUFXLHVCQUF1QixDQUFDO1lBQ3hELElBQUksS0FBSyxHQUFHLEdBQUcsYUFBSyxDQUFDLFdBQVcsa0JBQWtCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNyRSxJQUFJLEtBQUssR0FBRyxHQUFHLFNBQVMsU0FBUyxDQUFDO1lBQ2xDLElBQUksS0FBSyxHQUFHLEdBQUcsU0FBUyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMvQyxrQkFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUIsa0JBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzFCLHlCQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxhQUFhLG1CQUFRLENBQUMsa0JBQWtCLElBQUksT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7U0FDMUY7SUFDTCxDQUFDO0lBRUQsd0JBQXdCO0lBQ2hCLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxPQUF5QixFQUFFLE1BQW9CO1FBQzlFLHlCQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSx1QkFBdUIsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDakUsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxNQUFNLElBQUcsQ0FBQyxFQUFFO1lBQ25CLElBQUksU0FBUyxHQUFHLEdBQUcsbUJBQVEsQ0FBQyxrQkFBa0IsSUFBSSxPQUFPLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN6RixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDdEIseUJBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLGNBQWMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxPQUFPLEdBQUcsa0JBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNqRSxrQkFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDckU7U0FDSjtJQUNMLENBQUM7SUFFTyxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQXlCLEVBQUUsTUFBb0I7UUFDekUsUUFBUSxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ3RCLEtBQUssU0FBUztnQkFDVixPQUFPLENBQUMsR0FBRyxhQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUMzRSxLQUFLLEtBQUs7Z0JBQ04sT0FBTyxDQUFDLEdBQUcsYUFBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLENBQUM7WUFDOUY7Z0JBQ0kseUJBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDekQ7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUFqREQsa0NBaURDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gXCJmcy1leHRyYVwiO1xuaW1wb3J0IHsgSUJ1aWxkUmVzdWx0LCBJQnVpbGRUYXNrT3B0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL0Bjb2Nvcy9jcmVhdG9yLXR5cGVzL2VkaXRvci9wYWNrYWdlcy9idWlsZGVyL0B0eXBlc1wiO1xuaW1wb3J0IHsgQ29uc3RhbnQgfSBmcm9tIFwiLi4vLi4vdG9vbHMvQ29uc3RhbnRcIjtcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSBcIi4uLy4uL3Rvb2xzL1V0aWxzXCI7XG5pbXBvcnQgeyBCdWlsZExvZ2dlciB9IGZyb20gXCIuLi9CdWlsZExvZ2dlclwiO1xuXG5jb25zdCB0YWcgPSBcIltOYXRpdmVdXCI7XG5cbi8qKiDljp/nlJ/lubPlj7DmnoTlu7rlkI7nmoTlpITnkIYgKi9cbmV4cG9ydCBjbGFzcyBCdWlsZE5hdGl2ZSB7XG5cbiAgICBwdWJsaWMgc3RhdGljIGV4ZWN1dGUob3B0aW9uczogSUJ1aWxkVGFza09wdGlvbiwgcmVzdWx0OiBJQnVpbGRSZXN1bHQpIHtcbiAgICAgICAgaWYgKCFVdGlscy5pc05hdGl2ZShvcHRpb25zLnBsYXRmb3JtKSkgcmV0dXJuO1xuICAgICAgICBsZXQgYnVpbGROYXRpdmVEaXIgPSBgJHtVdGlscy5Qcm9qZWN0UGF0aH0vJHtDb25zdGFudC5CdWlsZE5hdGl2ZURpck5hbWV9YDtcbiAgICAgICAgZnMuZW5zdXJlRGlyU3luYyhidWlsZE5hdGl2ZURpcik7XG4gICAgICAgIHRoaXMuY29weU5hdGl2ZU1vZHVsZShvcHRpb25zLCByZXN1bHQpO1xuICAgICAgICB0aGlzLm1vZGlmeU5hdGl2ZVByb2plY3Qob3B0aW9ucywgcmVzdWx0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBjb3B5TmF0aXZlTW9kdWxlKG9wdGlvbnM6IElCdWlsZFRhc2tPcHRpb24sIHJlc3VsdDogSUJ1aWxkUmVzdWx0KSB7XG4gICAgICAgIGxldCBtb2R1bGVEaXIgPSBgJHtVdGlscy5Qcm9qZWN0UGF0aH0vJHtDb25zdGFudC5CdWlsZE5hdGl2ZURpck5hbWV9LyR7b3B0aW9ucy50YXNrTmFtZX1gO1xuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMobW9kdWxlRGlyKSkgey8vXG4gICAgICAgICAgICBsZXQgb0RpcjEgPSBgJHtVdGlscy5Qcm9qZWN0UGF0aH0vbmF0aXZlL2VuZ2luZS9jb21tb25gO1xuICAgICAgICAgICAgbGV0IG9EaXIyID0gYCR7VXRpbHMuUHJvamVjdFBhdGh9L25hdGl2ZS9lbmdpbmUvJHtvcHRpb25zLnBsYXRmb3JtfWA7XG4gICAgICAgICAgICBsZXQgZERpcjEgPSBgJHttb2R1bGVEaXJ9L2NvbW1vbmA7XG4gICAgICAgICAgICBsZXQgZERpcjIgPSBgJHttb2R1bGVEaXJ9LyR7b3B0aW9ucy5wbGF0Zm9ybX1gO1xuICAgICAgICAgICAgZnMuY29weVN5bmMob0RpcjEsIGREaXIxKTtcbiAgICAgICAgICAgIGZzLmNvcHlTeW5jKG9EaXIyLCBkRGlyMik7XG4gICAgICAgICAgICBCdWlsZExvZ2dlci5pbmZvKHRhZywgYOaLt+i0neWOn+eUn+W3peeoi+aooeWdl+WIsFske0NvbnN0YW50LkJ1aWxkTmF0aXZlRGlyTmFtZX0vJHtvcHRpb25zLnRhc2tOYW1lfV1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiDkv67mlLnljp/nlJ/lt6XnqIvvvIzkvb/lhbblvJXnlKjmi7fotJ3lkI7nmoTmqKHlnZcgKi9cbiAgICBwcml2YXRlIHN0YXRpYyBtb2RpZnlOYXRpdmVQcm9qZWN0KG9wdGlvbnM6IElCdWlsZFRhc2tPcHRpb24sIHJlc3VsdDogSUJ1aWxkUmVzdWx0KSB7XG4gICAgICAgIEJ1aWxkTG9nZ2VyLmluZm8odGFnLCBgbW9kaWZ5TmF0aXZlUHJvamVjdCAke29wdGlvbnMucGxhdGZvcm19YCk7XG4gICAgICAgIGxldCBmaWxlcyA9IHRoaXMuZ2V0TW9kaWZ5RmlsZXMob3B0aW9ucywgcmVzdWx0KTtcbiAgICAgICAgaWYgKGZpbGVzPy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsZXQgbmF0aXZlRGlyID0gYCR7Q29uc3RhbnQuQnVpbGROYXRpdmVEaXJOYW1lfS8ke29wdGlvbnMudGFza05hbWV9LyR7b3B0aW9ucy5wbGF0Zm9ybX1gO1xuICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgICAgICAgICAgQnVpbGRMb2dnZXIuaW5mbyh0YWcsIGBtb2RpZnlGaWxlICR7ZmlsZX1gKTtcbiAgICAgICAgICAgICAgICBsZXQgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlLCAndXRmOCcpO1xuICAgICAgICAgICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoXCJuYXRpdmUvZW5naW5lL1wiICsgb3B0aW9ucy5wbGF0Zm9ybSwgXCJnXCIpO1xuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZSwgY29udGVudC5yZXBsYWNlKHJlZ2V4LCBuYXRpdmVEaXIpLCBcInV0ZjhcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRNb2RpZnlGaWxlcyhvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMucGxhdGZvcm0pIHtcbiAgICAgICAgICAgIGNhc2UgXCJhbmRyb2lkXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtgJHtVdGlscy50b1VuaVNlcGFyYXRvcihyZXN1bHQuZGVzdCl9L3Byb2ovZ3JhZGxlLnByb3BlcnRpZXNgXTtcbiAgICAgICAgICAgIGNhc2UgXCJpb3NcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gW2Ake1V0aWxzLnRvVW5pU2VwYXJhdG9yKHJlc3VsdC5kZXN0KX0vcHJvai9uZXdjb29raW5nLnhjb2RlcHJvai9wcm9qZWN0LnBieHByb2pgXTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgQnVpbGRMb2dnZXIuaW5mbyh0YWcsIGDmnKrlpITnkIbnmoTlubPlj7BgLCBvcHRpb25zLnBsYXRmb3JtKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59Il19