
import fs from "fs-extra";
import path from "path";
import { IBuildResult, IBuildTaskOption } from "../../@types";
import { Config } from "../tools/Config";
import { LogToFile } from "../tools/LogToFile";
import { MLogger } from "../tools/MLogger";
import { Utils } from "../tools/Utils";
import { MainJsCode } from "./MainJsCode";
import { VersionGenerator } from "./VersionGenerator";

/** 原生平台检查构建配置和修改main.js */
export class HotUpdate {

    /** 修改main.js 和 src目录中的脚本 */
    static modifyJsFile(options: IBuildTaskOption, result: IBuildResult) {
        if (Utils.isNative(options.platform)) {
            // if (options.md5Cache) {
            //     LogToFile.log("若使用热更请关闭md5Cache");
            //     return;
            // }
            let buildPath = Utils.toUniSeparator(result.dest);
            Config.set("hotupdate.src", buildPath);

            let srcDir = path.join(result.dest, 'data', 'src');
            if (!fs.existsSync(srcDir)) {
                srcDir = path.join(result.dest, 'assets', 'src');
            }

            let files = Utils.getAllFiles(srcDir, null, true);
            //修改src目录下文件的文件名 去除md5
            let fileNameMap: Map<string, string> = new Map();
            files.forEach(file => {
                let fileName = path.basename(file);
                let ext = path.extname(file);
                let newFileName = fileName.replace(ext, "");
                if (fileName == "system.bundle") return;
                let lastIndex = newFileName.lastIndexOf(".");
                if (lastIndex > -1) {
                    newFileName = newFileName.substring(0, lastIndex);
                }
                newFileName += ext;
                fileNameMap.set(fileName, newFileName);
                fs.renameSync(file, file.replace(fileName, newFileName));
            });

            //修改src目录下文件
            files = Utils.getAllFiles(srcDir, null, true);
            files.forEach(file => {
                let content = fs.readFileSync(file, { encoding: "utf8" });
                fileNameMap.forEach((v, k) => {
                    let regex = new RegExp(k, "g");
                    content = content.replace(regex, v);
                });
                fs.writeFileSync(file, content, { encoding: "utf8" });
            });

            //修改main.js
            let mainjs = path.join(result.dest, 'data', 'main.js');
            if (!fs.existsSync(mainjs)) {
                mainjs = path.join(result.dest, 'assets', 'main.js');
            }

            if (fs.existsSync(mainjs)) {
                let version = Config.get("gameSetting.mainVersion", "");
                if (version) {
                    let content = fs.readFileSync(mainjs, { encoding: "utf8" });
                    fileNameMap.forEach((v, k) => {
                        let regex = new RegExp(k, "g");
                        content = content.replace(regex, v);
                    });
                    content = MainJsCode.code.replace("<%version%>", version) + "\n" + content;
                    fs.writeFileSync(mainjs, content, { encoding: "utf8" });
                    LogToFile.log("修改热更搜索路径完成", version);
                } else {
                    LogToFile.log("若使用热更请先保存热更配置");
                }
            }

        }
    }

    static genHotUpdateRes() {
        let src = Config.get("hotupdate.src", "");
        let url = Config.get("gameSetting.hotupdateServer", "");
        let version = Config.get("gameSetting.version", "");
        let dest = Utils.ProjectPath + "/hotupdate/" + version;
        if (!url || !version) {
            MLogger.info(`热更配置不正确,请先检查热更配置`);
        }
        if (!src) {
            MLogger.info(`请先构建一次Native工程 再生成热更资源`);
            return;
        }
        let newSrc = path.join(src, 'data');
        if (!fs.existsSync(newSrc)) {
            newSrc = path.join(src, 'assets');
        }
        src = Utils.toUniSeparator(newSrc);
        MLogger.info(`url=${url}`)
        MLogger.info(`version=${version}`)
        MLogger.info(`src=${src}`)
        MLogger.info(`dest=${dest}`)

        try {
            VersionGenerator.gen(url, version, src, dest);
            fs.copySync(src + '/src', dest + "/src");
            fs.copySync(src + '/assets', dest + "/assets");
            fs.copySync(src + '/jsb-adapter', dest + "/jsb-adapter");
            fs.copySync(dest + '/project.manifest', Utils.ProjectPath + "/assets/resources/project.manifest");
            Utils.refreshAsset(Utils.toAssetDBUrl(Utils.ProjectPath + "/assets/resources/project.manifest"));
        } catch (e) {
            MLogger.info(`生成热更资源失败 ${e}`);
        }

        MLogger.info(`生成热更资源完成 ${dest}`);
    }
}