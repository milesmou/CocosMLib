import child_process from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { MLogger } from "./MLogger";
export class Utils {

    private static projectPath: string;
    static get ProjectPath() {
        if (!this.projectPath) this.projectPath = this.toUniSeparator(Editor.Project.path);
        return this.projectPath;
    }

    static isNative(platform: string) {
        switch (platform) {
            case "windows":
            case "mac":
            case "linux":
            case "android":
            case "ios":
                return true;
        }
        return false;
    }

    static isMinigame(platform: string) {
        switch (platform) {
            case "wechatgame":
            case "alipay-mini-game":
            case "bytedance-mini-game":
            case "baidu-mini-game":
            case "taobao-creative-app":
                return true;
        }
        return false;
    }

    static exeCMD(workDir: string, cmd, onMsg: (msg: string) => void) {
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
                    MLogger.error(data.toString());
                } else {
                    MLogger.error(data.toString());
                }
            });
            result.on("close", (code) => {
                resolve(code ? code : 0);
            });
        })
        return p;
    }

    static getAllFiles(dir: string, filter?: (dir: string) => boolean, topDirOnly = false) {
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
            if (!filter || filter(file)) {
                files.push(this.toUniSeparator(file));
            }
        });
        return files;
    }

    static getAllDirs(dir: string, filter?: (dir: string) => boolean, topDirOnly = false) {
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
            if (!filter || filter(subDir)) {
                dirs.push(this.toUniSeparator(subDir));
            }
        });
        return dirs;
    }

    /** 根据文件路径找到追加了md5值的实际文件路径 */
    static resolveFilePath(filePath: string) {
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
        return result.replace(/\\/g, "/");
    }

    /** 将追加了md5的文件路径还原为正常的文件路径 */
    static restoreFilePath(filePath: string) {
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

    static refreshAsset(path: string) {
        if (!path.startsWith("db:") && fs.statSync(path).isDirectory()) {
            let files = Utils.getAllFiles(path, null, true);
            for (const file of files) {
                Editor.Message.send("asset-db", "refresh-asset", this.toAssetDBUrl(file));
            }
        } else {
            Editor.Message.send("asset-db", "refresh-asset", this.toAssetDBUrl(path));
        }
    }

    static deleteAsset(path: string) {
        Editor.Message.send("asset-db", "delete-asset", this.toAssetDBUrl(path));
    }

    static toAssetDBUrl(path: string) {
        if (path.startsWith("db://")) return path;
        else return path.replace(this.ProjectPath + "/", "db://");
    }

    static toAbsolutePath(dbUrlOrprojUrl: string) {
        if (dbUrlOrprojUrl.startsWith("db://")) return dbUrlOrprojUrl.replace("db://", this.ProjectPath + "/");
        else if (dbUrlOrprojUrl.startsWith("project://")) return dbUrlOrprojUrl.replace("db://", this.ProjectPath + "/");
        else return dbUrlOrprojUrl;
    }

    static toUniSeparator(path: string) {
        return path.replace(/\\/g, "/");
    }

    static splitLines(content: string) {
        let result: string[] = [];
        let arr = content.split("\r\n");
        for (const str of arr) {
            let arr1 = str.split("\n");
            result.push(...arr1);
        }
        return result;
    }

    static get returnSymbol() {
        switch (os.platform()) {
            case 'win32': return '\r\n' // windows
            default: return '\n'
        }
    }

}