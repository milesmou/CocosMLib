import fs from "fs-extra";
import { IBuildResult, IBuildTaskOption } from "../../../@cocos/creator-types/editor/packages/builder/@types";
import { Constant } from "../../tools/Constant";
import { Utils } from "../../tools/Utils";
import { BuildLogger } from "../BuildLogger";

const tag = "[Native]";

/** 原生平台构建后的处理 */
export class BuildNative {

    public static execute(options: IBuildTaskOption, result: IBuildResult) {
        if (!Utils.isNative(options.platform)) return;
        let buildNativeDir = `${Utils.ProjectPath}/${Constant.BuildNativeDirName}`;
        fs.ensureDirSync(buildNativeDir);
        this.copyNativeModule(options, result);
        this.modifyNativeProject(options, result);
    }

    private static copyNativeModule(options: IBuildTaskOption, result: IBuildResult) {

        let moduleDir = `${Utils.ProjectPath}/${Constant.BuildNativeDirName}/${options.taskName}`;
        if (!fs.existsSync(moduleDir)) {//
            let oDir1 = `${Utils.ProjectPath}/native/engine/common`;
            let oDir2 = `${Utils.ProjectPath}/native/engine/${options.platform}`;
            let dDir1 = `${moduleDir}/common`;
            let dDir2 = `${moduleDir}/${options.platform}`;
            fs.copySync(oDir1, dDir1);
            fs.copySync(oDir2, dDir2);
            BuildLogger.info(tag, `拷贝原生工程模块到[${Constant.BuildNativeDirName}/${options.taskName}]`);
        }
    }

    /** 修改原生工程，使其引用拷贝后的模块 */
    private static modifyNativeProject(options: IBuildTaskOption, result: IBuildResult) {
        BuildLogger.info(tag, `modifyNativeProject ${options.platform}`);
        switch (options.platform) {
            case "android":
                this.modifyAndroidProjectCfg(options, result);
                break;
        }
    }

    private static modifyAndroidProjectCfg(options: IBuildTaskOption, result: IBuildResult) {
        let nativeDir = `${Utils.ProjectPath}/${Constant.BuildNativeDirName}/${options.taskName}/${options.platform}`;
        let filePath = `${Utils.toUniSeparator(result.dest)}/proj/gradle.properties`;
        let content = fs.readFileSync(filePath, 'utf8');
        let lines = content.split("\r\n");
        if (lines.length < 2) content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith("NATIVE_DIR=")) {
                lines[i] = "NATIVE_DIR=" + nativeDir;
                break;
            }
        }
        fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    }
}