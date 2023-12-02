import fs from "fs-extra";
import path from "path";
import { IBuildTaskOption, IBuildResult } from "../../@types";
import { Config } from "../tools/Config";
import { Constant } from "../tools/Constant";
import { LogToFile } from "../tools/LogToFile";
import { Utils } from "../tools/Utils";

/** 拷贝自定义构建模板资源 */
export class BuildTemplate {
    static copy(options: IBuildTaskOption, result: IBuildResult) {
        if (!Config.get(Constant.BuildTemplateSaveKey, false)) {
            LogToFile.log("未启用构建模板");
            return;//未启用构建模板
        }
        let templatePath = Utils.ProjectPath + "/" + Constant.BuildTemplateDirName + "/" + options.platform;
        fs.ensureDirSync(templatePath);
        //拷贝模板目录资源
        let buildPath = Utils.toUniSeparator(result.dest);
        let files = Utils.getAllFiles(templatePath);
        for (const file of files) {
            let f = file.replace(templatePath, "");
            let newFile = this.resolveBuildDest(buildPath, options.platform) + f;
            LogToFile.log("copy file", f.replace("/", ""));
            fs.ensureDirSync(path.dirname(newFile));
            fs.copyFileSync(file, newFile);
        }

    }

    private static resolveBuildDest(buildDest, platform) {
        // if (platform == "android") {
        //     return buildDest + "/frameworks/runtime-src/proj.android-studio";
        // } else if (platform == "ios") {
        //     return buildDest + "/frameworks/runtime-src/proj.ios_mac";
        // } else if (platform == "win32") {
        //     return buildDest + "/frameworks/runtime-src/proj.win32";
        // }
        return buildDest;
    }
}