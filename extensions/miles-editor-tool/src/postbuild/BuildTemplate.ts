import fs from "fs-extra";
import path from "path";
import { IBuildResult, IBuildTaskOption } from "../../@types";
import { Config } from "../tools/Config";
import { Constant } from "../tools/Constant";
import { LogToFile } from "../tools/LogToFile";
import { MLogger } from "../tools/MLogger";
import { Utils } from "../tools/Utils";

/** 拷贝自定义构建模板资源 */
export class BuildTemplate {
    public static copy(options: IBuildTaskOption, result: IBuildResult) {
        if (!Config.get(Constant.BuildTemplateSaveKey, false)) {
            LogToFile.log("未启用构建模板");
            MLogger.info("未启用构建模板");
            return;//未启用构建模板
        }
        let templatePath = Utils.ProjectPath + "/" + Constant.BuildTemplateDirName + "/" + options.platform;
        fs.ensureDirSync(templatePath);
        //拷贝模板目录资源
        let insertPrefix = "insert_";//以这个前缀开头的文件 会将构建模版中的内容插入到构建后的文件开头
        let buildPath = Utils.toUniSeparator(result.dest);
        let files = Utils.getAllFiles(templatePath);
        let buildDest = this.resolveBuildDest(buildPath, options.platform);
        for (const file of files) {
            let f = file.replace(templatePath, "").replace("/", "");
            if (f.startsWith("insert_")) {
                f = f.replace("insert_", "");
                let newFile = buildDest + "/" + f;
                LogToFile.log("insert code ", f);
                this.insertCode(file, newFile);
            } else {
                let newFile = buildDest + "/" + f;
                LogToFile.log("copy file", f);
                fs.ensureDirSync(path.dirname(newFile));
                fs.copyFileSync(file, newFile);
            }
        }
    }

    /** 如果构建模板中有特殊脚本 插入内容到构建出的文件内容开头 */
    private static insertCode(src: string, dest: string) {
        let code = fs.readFileSync(src, { encoding: "utf8" });
        let destContent = fs.readFileSync(dest, { encoding: "utf8" });
        fs.writeFileSync(dest, code + "\n" + destContent);
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