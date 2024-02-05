
import fs from "fs-extra";
import path from "path";
import { IBuildResult, IBuildTaskOption } from "../../@types";
import { Config } from "../tools/Config";
import { LogToFile } from "../tools/LogToFile";
import { Utils } from "../tools/Utils";
import { MainJsCode } from "./MainJsCode";
import { VersionGgenerator } from "./VersionGgenerator";

/** 原生平台检查构建配置和修改main.js */
export class HotUpdate {

    static modifyMainJs(options: IBuildTaskOption, result: IBuildResult) {
        if (Utils.isNative(options.platform)) {
            // if (options.md5Cache) {
            //     LogToFile.log("若使用热更请关闭md5Cache");
            //     return;
            // }
            let buildPath = Utils.toUniSeparator(result.dest);
            Config.set("hotupdate.src", buildPath);
            let filePath = path.join(result.dest, 'data', 'main.js');
            if (!fs.existsSync(filePath)) {
                filePath = path.join(result.dest, 'assets', 'main.js');
            }

            if (fs.existsSync(filePath)) {
                let version = Config.get("hotupdate.version", "");
                if (version) {
                    let arr = version.split(".");
                    if (arr.length == 4) version = arr.slice(0, 3).join(".");
                    let content = MainJsCode.code.replace("<%version%>", version) + "\n" + fs.readFileSync(filePath, { encoding: "utf8" });
                    fs.writeFileSync(filePath, content, { encoding: "utf8" });
                    LogToFile.log("修改热更搜索路径完成", version);
                } else {
                    LogToFile.log("若使用热更请先保存热更配置");
                }
            }

        }
    }


    static genHotUpdateRes() {
        let url = Config.get("hotupdate.url", "");
        let version = Config.get("hotupdate.version", "");
        let src = Config.get("hotupdate.src", "");
        let dest = Utils.ProjectPath + "/hotupdate/" + version;
        if (!url || !version) {
            LogToFile.log(`热更配置不正确,请先检查热更配置`);
        }
        if (!src) {
            LogToFile.log(`请先构建一次Native工程 再生成热更资源`);
            return;
        }
        let newSrc = path.join(src, 'data');
        if (!fs.existsSync(newSrc)) {
            newSrc = path.join(src, 'assets');
        }
        src = Utils.toUniSeparator(newSrc);
        LogToFile.log(`url=${url}`)
        LogToFile.log(`version=${version}`)
        LogToFile.log(`src=${src}`)
        LogToFile.log(`dest=${dest}`)

        try {
            VersionGgenerator.gen(url, version, src, dest);
            fs.copySync(src + '/src', dest + "/src");
            fs.copySync(src + '/assets', dest + "/assets");
            fs.copySync(src + '/jsb-adapter', dest + "/jsb-adapter");
            fs.copySync(dest + '/project.manifest', Utils.ProjectPath + "/assets/resources/project.manifest");
            Utils.refreshAsset(Utils.toAssetDBUrl(Utils.ProjectPath + "/assets/resources/project.manifest"));
        } catch (e) {
            LogToFile.log(`生成热更资源失败 ${e}`);
        }

        LogToFile.log(`生成热更资源完成 ${dest}`);
    }
}