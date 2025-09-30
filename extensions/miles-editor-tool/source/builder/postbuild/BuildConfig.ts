import fs from "fs-extra";
import path from "path";
import { IBuildResult, IBuildTaskOption } from "../../../@cocos/creator-types/editor/packages/builder/@types";
import { Constant } from "../../tools/Constant";
import { Utils } from "../../tools/Utils";
import { BuildLogger } from "../BuildLogger";


interface InsertCode {
    file: string;
    line: number;
    content: string | string[];
}

interface ReplaceValue {
    file: string;
    label: string;
    scriptName: string;
    scriptField: string;
}

interface ReplaceAssetValue {
    uuid: string;
    asset: string;
}

interface Config {
    insert: InsertCode[];
    replace: ReplaceValue[];
    replaceAsset: ReplaceAssetValue[];
}

/** 自定义构建配置处理 */
export class BuildConfig {

    public static execute(options: IBuildTaskOption, result: IBuildResult) {
        let buildConfigDir = `${Utils.ProjectPath}/${Constant.BuildConfigDirName}`;
        fs.ensureDirSync(buildConfigDir);
        let buildConfig = `${Utils.ProjectPath}/${Constant.BuildConfigDirName}/${options.taskName}.json`;
        if (!fs.existsSync(buildConfig)) this.createBuildConfig(buildConfig);
        let config = fs.readJsonSync(buildConfig, { encoding: "utf8" }) as Config;
        this.copyTemplate(options, result);
        this.insert(options, result, config.insert);
        this.replace(options, result, config.replace);
        this.replaceAsset(options, result, config.replaceAsset);
    }

    private static createBuildConfig(path: string) {
        let obj = {
            "注释": {
                "!注意!": "下面的file字段均为与构建目录的相对路径",
                "insert": "在指定文件的指定行插入需要的代码 字段解释{file:文件名 line:第几行 content:插入内容}",
                "replace": "替换指定文件中的字符串为需要的值 字段解释{file:文件名 label:文件中被替代的文本 scriptName:从GameSetting上哪个脚本获取属性值 scriptField:脚本中的字段名字}",
                "replaceAsset": "使用assets目录中的文件替换打包后的文件 字段解释{uuid:被替换文件的uuid asset:buildConfig下assets目录中的文件名 }"
            },
            "insert": [],
            "replace": [],
            "replaceAsset": []
        }
        fs.createFileSync(path);
        fs.writeJsonSync(path, obj, { spaces: 4 });
    }

    /**  拷贝模板目录资源 */
    private static copyTemplate(options: IBuildTaskOption, result: IBuildResult) {
        let tag = "[Template]";
        let templatePath = `${Utils.ProjectPath}/${Constant.BuildConfigDirName}/${Constant.BuildTemplateDirName}/${options.taskName}`;
        fs.ensureDirSync(templatePath);
        let buildPath = Utils.toUniSeparator(result.dest);
        let files = Utils.getAllFiles(templatePath);
        let buildDest = this.resolveBuildDest(buildPath, options.platform);
        for (const file of files) {
            let f = file.replace(templatePath, "").replace("/", "");
            let newFile = Utils.resolveFilePath(buildDest + "/" + f);
            fs.ensureDirSync(path.dirname(newFile));
            fs.copyFileSync(file, newFile);
            BuildLogger.info(tag, "copy file", f);
        }
    }

    /** 在文件指定位置插入代码 */
    private static insert(options: IBuildTaskOption, result: IBuildResult, data: InsertCode[]) {
        if (!data) return;
        let tag = "[InsertCode]";
        let buildDest = this.resolveBuildDest(Utils.toUniSeparator(result.dest), options.platform);
        for (const d of data) {
            let destFile = Utils.resolveFilePath(buildDest + "/" + d.file);
            if (!fs.existsSync(destFile)) {
                BuildLogger.warn(tag, "文件不存在", d.file);
                continue;
            }

            let codeArr: string[];
            if (typeof d.content === "string") {
                codeArr = d.content.split("\n");
            } else {
                codeArr = d.content;
            }
            let destContent = fs.readFileSync(destFile, { encoding: "utf8" });
            let destArr = destContent.split("\r\n");
            if (destArr.length < 2) {
                destArr = destContent.split("\n");
            }
            destArr.splice(d.line - 1, 0, ...codeArr);
            fs.writeFileSync(destFile, destArr.join("\n"));
            BuildLogger.info(tag, d.file);
        }
    }

    /** 替换指定文件中的字符串为需要的值 */
    private static replace(options: IBuildTaskOption, result: IBuildResult, data: ReplaceValue[]) {
        if (!data) return;
        let tag = "[ReplaceValue]";
        let buildDest = this.resolveBuildDest(Utils.toUniSeparator(result.dest), options.platform);
        let mainScene = Utils.findFile(Utils.ProjectPath + "/assets", v => v.endsWith("main.scene"));

        if (!fs.existsSync(mainScene)) {
            BuildLogger.warn(tag, "main.scene文件不存在");
            return;
        }
        let objs: any[] = fs.readJsonSync(mainScene, { encoding: "utf-8" });

        for (const d of data) {
            let destFile = Utils.resolveFilePath(buildDest + "/" + d.file);
            if (!fs.existsSync(destFile)) {
                BuildLogger.warn(tag, "文件不存在", d.file);
                continue;
            }
            let obj = objs.find(v => v['_scriptName'] == d.scriptName);
            if (obj) {
                let value = obj[d.scriptField];
                let destContent = fs.readFileSync(destFile, { encoding: "utf8" });
                destContent = destContent.replace(d.label, value);
                fs.writeFileSync(destFile, destContent);
                BuildLogger.info(tag, d.file, d.label, value);
            } else {
                BuildLogger.warn(tag, "对象未找到", d.scriptName);
            }

        }
    }

    /** 使用assets目录中的文件替换打包后的文件 */
    private static replaceAsset(options: IBuildTaskOption, result: IBuildResult, data: ReplaceAssetValue[]) {
        let assetsPath = `${Utils.ProjectPath}/${Constant.BuildConfigDirName}/${Constant.BuildAssetsDirName}`;
        fs.ensureDirSync(assetsPath);
        if (!data) return;
        let tag = "[ReplaceAssetValue]";
        let buildDest = this.resolveBuildDest(Utils.toUniSeparator(result.dest), options.platform);

        for (const d of data) {
            let oFile = `${assetsPath}/${d.asset}`;
            if (!fs.existsSync(oFile)) {
                BuildLogger.warn(tag, "源文件文件不存在", d.uuid, d.asset);
                continue;
            }
            let ext = path.extname(oFile);
            let destFile = Utils.getAllFiles(buildDest, file => file.includes(d.uuid) && file.endsWith(ext))[0];
            if (!fs.existsSync(destFile)) {
                BuildLogger.warn(tag, "目标文件不存在", d.uuid, d.asset);
                continue;
            }

            fs.copyFileSync(oFile, destFile);
            BuildLogger.info(tag, d.uuid, d.asset);
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