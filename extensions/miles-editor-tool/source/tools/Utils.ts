import child_process from "child_process";
import crypto from "crypto";
import fs from "fs-extra";
import path from "path";
import { Platform } from "../../@cocos/creator-types/editor/packages/builder/@types";
import { Logger } from "./Logger";
export class Utils {

    private static projectPath: string;
    public static get ProjectPath() {
        if (!this.projectPath) this.projectPath = this.toUniSeparator(Editor.Project.path);
        return this.projectPath;
    }

    /** 是否原生平台 */
    public static isNative(platform: Platform) {
        switch (platform) {
            case "windows":
            case "mac":
            case "linux":
            case "android":
            case "ios":
            case "ohos":
            case "harmonyos-next":
                return true;
        }
        return false;
    }

    /** 是否小游戏平台 */
    public static isMinigame(platform: Platform) {
        switch (platform) {
            case "wechatgame":
            case "wechatprogram":
            case "oppo-mini-game":
            case "vivo-mini-game":
            case "huawei-quick-game":
            case "migu-mini-game":
            case "alipay-mini-game":
            case "taobao-creative-app":
            case "taobao-mini-game":
            case "xiaomi-quick-game":
            case "baidu-mini-game":
            case "bytedance-mini-game":
                return true;
        }
        return false;
    }

    /** 执行终端命令 */
    public static exeCMD(workDir: string, cmd: string, onMsg?: (msg: string) => void) {
        let p = new Promise((resolve, reject) => {
            let result = child_process.exec(cmd, { cwd: workDir });
            result.stdout.on("data", (data) => {
                let d = data.toString();
                onMsg && onMsg(d);
                if (d.indexOf("continue") > -1) {
                    result.kill();
                }
            });
            result.stderr.on("data", (data) => {
                if (globalThis['Editor']) {
                    Logger.error(data.toString());
                } else {
                    Logger.error(data.toString());
                }
            });
            result.on("close", (code) => {
                resolve(code ? code : 0);
            });
        })
        return p;
    }

    /** 获取指定目录下所有文件 */
    public static getAllFiles(dir: string, filter?: (file: string) => boolean, topDirOnly = false) {
        dir = this.toAbsolutePath(dir);
        let files: string[] = [];
        if (!fs.existsSync(dir)) return files;
        let walkSync = (currentDir: string, callback: (filePath: string) => void) => {
            fs.readdirSync(currentDir, { withFileTypes: true }).forEach(dirent => {
                let p = path.join(currentDir, dirent.name);
                if (dirent.isFile()) {
                    callback(p);
                } else if (dirent.isDirectory()) {
                    if (topDirOnly) return;
                    walkSync(p, callback);
                }

            });
        };
        walkSync(dir, file => {
            if (file.endsWith(".meta")) return;
            file = this.toUniSeparator(file);
            if (!filter || filter(file)) {
                files.push(file);
            }
        });
        return files;
    }



    /** 获取指定目录下所有目录 */
    public static getAllDirs(dir: string, filter?: (dir: string) => boolean, topDirOnly = false) {
        dir = this.toAbsolutePath(dir);
        let dirs: string[] = [];
        if (!fs.existsSync(dir)) return dirs;
        let walkSync = (currentDir: string, callback: (filePath: string) => void) => {
            fs.readdirSync(currentDir, { withFileTypes: true }).forEach(dirent => {
                let p = path.join(currentDir, dirent.name);
                if (dirent.isDirectory()) {
                    callback(p);
                    if (topDirOnly) return;
                    walkSync(p, callback);
                }
            });
        };
        walkSync(dir, subDir => {
            subDir = this.toUniSeparator(subDir);
            if (!filter || filter(subDir)) {
                dirs.push(subDir);
            }
        });
        return dirs;
    }

    /** 查找指定目录下的一个文件 */
    public static findFile(dir: string, filter?: (file: string) => boolean, topDirOnly = false) {
        dir = this.toAbsolutePath(dir);
        let filePath = null;
        if (!fs.existsSync(dir)) return filePath;
        let walkSync = (currentDir: string, callback: (filePath: string) => boolean) => {
            let dirents = fs.readdirSync(currentDir, { withFileTypes: true });
            for (const dirent of dirents) {
                let p = path.join(currentDir, dirent.name);
                if (dirent.isFile()) {
                    if (callback(p)) break;
                } else if (dirent.isDirectory()) {
                    if (topDirOnly) return;
                    walkSync(p, callback);
                }
            }
        };
        walkSync(dir, file => {
            if (file.endsWith(".meta")) return false;
            if (!filter || filter(file)) {
                filePath = this.toUniSeparator(file);
                return true;
            }
            return false;
        });
        return filePath;
    }

    /** 根据文件路径找到追加了Md5值的实际文件路径 */
    public static resolveFilePath(filePath: string) {
        let result = filePath;
        let dir = path.dirname(filePath);
        if (fs.existsSync(dir)) {
            let basename = path.basename(filePath);
            let ext = path.extname(filePath);
            let name = basename.replace(ext, ".");
            let reg = new RegExp(`${name}[A-Za-z0-9]{5}${ext}`);
            let dirents = fs.readdirSync(dir, { withFileTypes: true });
            for (const dirent of dirents) {
                let p = path.join(dir, dirent.name);
                if (dirent.isFile()) {
                    if (dirent.name == basename) {
                        break;
                    } else {
                        if (reg.test(dirent.name)) {
                            result = p;
                            break;
                        }
                    }
                }
            }
        }
        return this.toUniSeparator(result);
    }

    /** 将追加了Md5的文件路径还原为正常的文件路径 */
    public static restoreFilePath(filePath: string) {
        let ext = path.extname(filePath);
        let p = filePath.replace(ext, "");
        let reg = new RegExp(/.+\.[A-Za-z0-9]{5}/);
        if (reg.test(p)) {
            let index = p.lastIndexOf(".")
            return p.substring(0, index) + ext;
        } else {
            return filePath;
        }
    }

    /** 修改文件名，使其文件名后追加Md5值 */
    public static appendMd5(filePath: string) {
        if (fs.existsSync(filePath)) {
            let ext = path.extname(filePath);
            let p = filePath.replace(ext, "");
            let reg = new RegExp(/.+\.[A-Za-z0-9]{5}/);
            if (!reg.test(p)) {
                let md5 = crypto.createHash('md5').update(fs.readFileSync(filePath) as any).digest('hex');
                let shortMd5 = md5.substring(0, 6);
                let newFilePath = p + "." + shortMd5 + ext;
                fs.renameSync(filePath, newFilePath);
            }
        }
    }

    /** 修改文件名，移除其文件名后的Md5值 */
    public static removeMd5(filePath: string) {
        if (fs.existsSync(filePath)) {
            let newFilePath = this.restoreFilePath(filePath);
            fs.renameSync(filePath, newFilePath);
        }
    }



    /** 刷新编辑器内的资源 */
    public static refreshAsset(path: string) {
        if (!path.startsWith("db:") && fs.statSync(path).isDirectory()) {
            let files = Utils.getAllFiles(path, null, true);
            for (const file of files) {
                Editor.Message.send("asset-db", "refresh-asset", this.toAssetDBUrl(file));
            }
        } else {
            Editor.Message.send("asset-db", "refresh-asset", this.toAssetDBUrl(path));
        }
    }

    /** 删除编辑器内的资源 */
    public static deleteAsset(path: string) {
        Editor.Message.send("asset-db", "delete-asset", this.toAssetDBUrl(path));
    }

    /** 将本地文件路径转化为编辑器内资源路径 */
    public static toAssetDBUrl(path: string) {
        if (path.startsWith("db://")) return path;
        else return path.replace(this.ProjectPath + "/", "db://");
    }

    /** 将编辑器内资源路径转化为本地文件路径 */
    public static toAbsolutePath(dbUrlOrprojUrl: string) {
        if (dbUrlOrprojUrl.startsWith("db://")) return dbUrlOrprojUrl.replace("db://", this.ProjectPath + "/");
        else if (dbUrlOrprojUrl.startsWith("project://")) return dbUrlOrprojUrl.replace("db://", this.ProjectPath + "/");
        else return dbUrlOrprojUrl;
    }

    /** 统一路径分隔符为(/) */
    public static toUniSeparator(path: string) {
        return path.replace(/\\/g, "/");
    }

    /** 统一换行符为(\n) */
    public static toUniLineBrake(content: string) {
        return content.replace(/\\r\\n/g, "\n");
    }

    /** 获取文件或者目录所在的bundle路径 */
    public static getBundlePath(filePath: string) {
        filePath = this.toUniSeparator(filePath);
        let dir = path.dirname(filePath);
        while (true) {
            let meta = dir + ".meta";
            if (fs.existsSync(meta)) {
                let obj = fs.readJsonSync(meta);
                if (obj?.userData?.isBundle) {
                    return dir;
                } else {
                    dir = path.dirname(dir);
                    if (dir == this.projectPath) break;
                }
            } else {
                break;
            }
        }
        return null;
    }
}