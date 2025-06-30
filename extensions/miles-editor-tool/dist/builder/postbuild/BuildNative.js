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
        switch (options.platform) {
            case "android":
                this.modifyAndroidProjectCfg(options, result);
                break;
        }
    }
    static modifyAndroidProjectCfg(options, result) {
        let nativeDir = `${Utils_1.Utils.ProjectPath}/${Constant_1.Constant.BuildNativeDirName}/${options.taskName}/${options.platform}`;
        let filePath = `${Utils_1.Utils.toUniSeparator(result.dest)}/proj/gradle.properties`;
        let content = fs_extra_1.default.readFileSync(filePath, 'utf8');
        let lines = content.split("\r\n");
        if (lines.length < 2)
            content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith("NATIVE_DIR=")) {
                lines[i] = "NATIVE_DIR=" + nativeDir;
                break;
            }
        }
        fs_extra_1.default.writeFileSync(filePath, lines.join("\n"), "utf8");
    }
}
exports.BuildNative = BuildNative;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGROYXRpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvYnVpbGRlci9wb3N0YnVpbGQvQnVpbGROYXRpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsd0RBQTBCO0FBRTFCLG1EQUFnRDtBQUNoRCw2Q0FBMEM7QUFDMUMsZ0RBQTZDO0FBRTdDLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQztBQUV2QixpQkFBaUI7QUFDakIsTUFBYSxXQUFXO0lBRWIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUF5QixFQUFFLE1BQW9CO1FBQ2pFLElBQUksQ0FBQyxhQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7WUFBRSxPQUFPO1FBQzlDLElBQUksY0FBYyxHQUFHLEdBQUcsYUFBSyxDQUFDLFdBQVcsSUFBSSxtQkFBUSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDM0Usa0JBQUUsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFTyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBeUIsRUFBRSxNQUFvQjtRQUUzRSxJQUFJLFNBQVMsR0FBRyxHQUFHLGFBQUssQ0FBQyxXQUFXLElBQUksbUJBQVEsQ0FBQyxrQkFBa0IsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDMUYsSUFBSSxDQUFDLGtCQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUMsRUFBRTtZQUM5QixJQUFJLEtBQUssR0FBRyxHQUFHLGFBQUssQ0FBQyxXQUFXLHVCQUF1QixDQUFDO1lBQ3hELElBQUksS0FBSyxHQUFHLEdBQUcsYUFBSyxDQUFDLFdBQVcsa0JBQWtCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNyRSxJQUFJLEtBQUssR0FBRyxHQUFHLFNBQVMsU0FBUyxDQUFDO1lBQ2xDLElBQUksS0FBSyxHQUFHLEdBQUcsU0FBUyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMvQyxrQkFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUIsa0JBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzFCLHlCQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxhQUFhLG1CQUFRLENBQUMsa0JBQWtCLElBQUksT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7U0FDMUY7SUFDTCxDQUFDO0lBRUQsd0JBQXdCO0lBQ2hCLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxPQUF5QixFQUFFLE1BQW9CO1FBQzlFLHlCQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSx1QkFBdUIsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDakUsUUFBUSxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ3RCLEtBQUssU0FBUztnQkFDVixJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUM5QyxNQUFNO1NBQ2I7SUFDTCxDQUFDO0lBRU8sTUFBTSxDQUFDLHVCQUF1QixDQUFDLE9BQXlCLEVBQUUsTUFBb0I7UUFDbEYsSUFBSSxTQUFTLEdBQUcsR0FBRyxhQUFLLENBQUMsV0FBVyxJQUFJLG1CQUFRLENBQUMsa0JBQWtCLElBQUksT0FBTyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDOUcsSUFBSSxRQUFRLEdBQUcsR0FBRyxhQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUM7UUFDN0UsSUFBSSxPQUFPLEdBQUcsa0JBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUM7WUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ25DLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ2hDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxhQUFhLEdBQUcsU0FBUyxDQUFDO2dCQUNyQyxNQUFNO2FBQ1Q7U0FDSjtRQUNELGtCQUFFLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pELENBQUM7Q0FDSjtBQWpERCxrQ0FpREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSBcImZzLWV4dHJhXCI7XG5pbXBvcnQgeyBJQnVpbGRSZXN1bHQsIElCdWlsZFRhc2tPcHRpb24gfSBmcm9tIFwiLi4vLi4vLi4vQGNvY29zL2NyZWF0b3ItdHlwZXMvZWRpdG9yL3BhY2thZ2VzL2J1aWxkZXIvQHR5cGVzXCI7XG5pbXBvcnQgeyBDb25zdGFudCB9IGZyb20gXCIuLi8uLi90b29scy9Db25zdGFudFwiO1xuaW1wb3J0IHsgVXRpbHMgfSBmcm9tIFwiLi4vLi4vdG9vbHMvVXRpbHNcIjtcbmltcG9ydCB7IEJ1aWxkTG9nZ2VyIH0gZnJvbSBcIi4uL0J1aWxkTG9nZ2VyXCI7XG5cbmNvbnN0IHRhZyA9IFwiW05hdGl2ZV1cIjtcblxuLyoqIOWOn+eUn+W5s+WPsOaehOW7uuWQjueahOWkhOeQhiAqL1xuZXhwb3J0IGNsYXNzIEJ1aWxkTmF0aXZlIHtcblxuICAgIHB1YmxpYyBzdGF0aWMgZXhlY3V0ZShvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xuICAgICAgICBpZiAoIVV0aWxzLmlzTmF0aXZlKG9wdGlvbnMucGxhdGZvcm0pKSByZXR1cm47XG4gICAgICAgIGxldCBidWlsZE5hdGl2ZURpciA9IGAke1V0aWxzLlByb2plY3RQYXRofS8ke0NvbnN0YW50LkJ1aWxkTmF0aXZlRGlyTmFtZX1gO1xuICAgICAgICBmcy5lbnN1cmVEaXJTeW5jKGJ1aWxkTmF0aXZlRGlyKTtcbiAgICAgICAgdGhpcy5jb3B5TmF0aXZlTW9kdWxlKG9wdGlvbnMsIHJlc3VsdCk7XG4gICAgICAgIHRoaXMubW9kaWZ5TmF0aXZlUHJvamVjdChvcHRpb25zLCByZXN1bHQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGNvcHlOYXRpdmVNb2R1bGUob3B0aW9uczogSUJ1aWxkVGFza09wdGlvbiwgcmVzdWx0OiBJQnVpbGRSZXN1bHQpIHtcblxuICAgICAgICBsZXQgbW9kdWxlRGlyID0gYCR7VXRpbHMuUHJvamVjdFBhdGh9LyR7Q29uc3RhbnQuQnVpbGROYXRpdmVEaXJOYW1lfS8ke29wdGlvbnMudGFza05hbWV9YDtcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKG1vZHVsZURpcikpIHsvL1xuICAgICAgICAgICAgbGV0IG9EaXIxID0gYCR7VXRpbHMuUHJvamVjdFBhdGh9L25hdGl2ZS9lbmdpbmUvY29tbW9uYDtcbiAgICAgICAgICAgIGxldCBvRGlyMiA9IGAke1V0aWxzLlByb2plY3RQYXRofS9uYXRpdmUvZW5naW5lLyR7b3B0aW9ucy5wbGF0Zm9ybX1gO1xuICAgICAgICAgICAgbGV0IGREaXIxID0gYCR7bW9kdWxlRGlyfS9jb21tb25gO1xuICAgICAgICAgICAgbGV0IGREaXIyID0gYCR7bW9kdWxlRGlyfS8ke29wdGlvbnMucGxhdGZvcm19YDtcbiAgICAgICAgICAgIGZzLmNvcHlTeW5jKG9EaXIxLCBkRGlyMSk7XG4gICAgICAgICAgICBmcy5jb3B5U3luYyhvRGlyMiwgZERpcjIpO1xuICAgICAgICAgICAgQnVpbGRMb2dnZXIuaW5mbyh0YWcsIGDmi7fotJ3ljp/nlJ/lt6XnqIvmqKHlnZfliLBbJHtDb25zdGFudC5CdWlsZE5hdGl2ZURpck5hbWV9LyR7b3B0aW9ucy50YXNrTmFtZX1dYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiog5L+u5pS55Y6f55Sf5bel56iL77yM5L2/5YW25byV55So5ou36LSd5ZCO55qE5qih5Z2XICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgbW9kaWZ5TmF0aXZlUHJvamVjdChvcHRpb25zOiBJQnVpbGRUYXNrT3B0aW9uLCByZXN1bHQ6IElCdWlsZFJlc3VsdCkge1xuICAgICAgICBCdWlsZExvZ2dlci5pbmZvKHRhZywgYG1vZGlmeU5hdGl2ZVByb2plY3QgJHtvcHRpb25zLnBsYXRmb3JtfWApO1xuICAgICAgICBzd2l0Y2ggKG9wdGlvbnMucGxhdGZvcm0pIHtcbiAgICAgICAgICAgIGNhc2UgXCJhbmRyb2lkXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RpZnlBbmRyb2lkUHJvamVjdENmZyhvcHRpb25zLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgbW9kaWZ5QW5kcm9pZFByb2plY3RDZmcob3B0aW9uczogSUJ1aWxkVGFza09wdGlvbiwgcmVzdWx0OiBJQnVpbGRSZXN1bHQpIHtcbiAgICAgICAgbGV0IG5hdGl2ZURpciA9IGAke1V0aWxzLlByb2plY3RQYXRofS8ke0NvbnN0YW50LkJ1aWxkTmF0aXZlRGlyTmFtZX0vJHtvcHRpb25zLnRhc2tOYW1lfS8ke29wdGlvbnMucGxhdGZvcm19YDtcbiAgICAgICAgbGV0IGZpbGVQYXRoID0gYCR7VXRpbHMudG9VbmlTZXBhcmF0b3IocmVzdWx0LmRlc3QpfS9wcm9qL2dyYWRsZS5wcm9wZXJ0aWVzYDtcbiAgICAgICAgbGV0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGY4Jyk7XG4gICAgICAgIGxldCBsaW5lcyA9IGNvbnRlbnQuc3BsaXQoXCJcXHJcXG5cIik7XG4gICAgICAgIGlmIChsaW5lcy5sZW5ndGggPCAyKSBjb250ZW50LnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5lID0gbGluZXNbaV07XG4gICAgICAgICAgICBpZiAobGluZS5zdGFydHNXaXRoKFwiTkFUSVZFX0RJUj1cIikpIHtcbiAgICAgICAgICAgICAgICBsaW5lc1tpXSA9IFwiTkFUSVZFX0RJUj1cIiArIG5hdGl2ZURpcjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBsaW5lcy5qb2luKFwiXFxuXCIpLCBcInV0ZjhcIik7XG4gICAgfVxufSJdfQ==