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
        let files = this.getModifyFiles(options, result);
        if (files?.length > 0) {
            let nativeDir = `${Constant.BuildNativeDirName}/${options.taskName}/${options.platform}`;
            for (const file of files) {
                BuildLogger.info(tag, `modifyFile ${file}`);
                let content = fs.readFileSync(file, 'utf8');
                let regex = new RegExp("native/engine/" + options.platform, "g");
                fs.writeFileSync(file, content.replace(regex, nativeDir), "utf8");
            }
        }
    }

    private static getModifyFiles(options: IBuildTaskOption, result: IBuildResult) {
        switch (options.platform) {
            case "android":
                return [`${Utils.toUniSeparator(result.dest)}/proj/gradle.properties`];
            case "ios":
                return [`${Utils.toUniSeparator(result.dest)}/proj/newcooking.xcodeproj/project.pbxproj`];
            default:
                BuildLogger.info(tag, `未处理的平台`, options.platform);
        }
        return null;
    }
}