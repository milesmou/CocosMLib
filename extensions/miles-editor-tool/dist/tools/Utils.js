"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const child_process_1 = __importDefault(require("child_process"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const MLogger_1 = require("./MLogger");
class Utils {
    static get ProjectPath() {
        if (!this.projectPath)
            this.projectPath = this.toUniSeparator(Editor.Project.path);
        return this.projectPath;
    }
    static isNative(platform) {
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
    static isMinigame(platform) {
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
    static exeCMD(workDir, cmd, onMsg) {
        let p = new Promise((resolve, reject) => {
            let result = child_process_1.default.exec(cmd, { cwd: workDir });
            result.stdout.on("data", (data) => {
                let d = data.toString();
                onMsg && onMsg(d);
                if (d.indexOf("continue") > -1) {
                    result.kill();
                }
            });
            result.stderr.on("data", (data) => {
                if (globalThis['Editor']) {
                    MLogger_1.MLogger.error(data.toString());
                }
                else {
                    MLogger_1.MLogger.error(data.toString());
                }
            });
            result.on("close", (code) => {
                resolve(code ? code : 0);
            });
        });
        return p;
    }
    static getAllFiles(dir, filter, topDirOnly = false) {
        dir = this.toAbsolutePath(dir);
        let files = [];
        if (!fs_1.default.existsSync(dir))
            return files;
        let walkSync = (currentDir, callback) => {
            fs_1.default.readdirSync(currentDir, { withFileTypes: true }).forEach(dirent => {
                let p = path_1.default.join(currentDir, dirent.name);
                if (dirent.isFile()) {
                    callback(p);
                }
                else if (dirent.isDirectory()) {
                    if (topDirOnly)
                        return;
                    walkSync(p, callback);
                }
            });
        };
        walkSync(dir, file => {
            if (file.endsWith(".meta"))
                return;
            if (!filter || filter(file)) {
                files.push(this.toUniSeparator(file));
            }
        });
        return files;
    }
    static getAllDirs(dir, filter, topDirOnly = false) {
        dir = this.toAbsolutePath(dir);
        let dirs = [];
        if (!fs_1.default.existsSync(dir))
            return dirs;
        let walkSync = (currentDir, callback) => {
            fs_1.default.readdirSync(currentDir, { withFileTypes: true }).forEach(dirent => {
                let p = path_1.default.join(currentDir, dirent.name);
                if (dirent.isDirectory()) {
                    callback(p);
                    if (topDirOnly)
                        return;
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
    static resolveFilePath(filePath) {
        let dir = path_1.default.dirname(filePath);
        let basename = path_1.default.basename(filePath);
        let ext = path_1.default.extname(filePath);
        let name = basename.replace(ext, ".");
        let reg = new RegExp(`${name}[A-Za-z0-9]{5}${ext}`);
        let dirents = fs_1.default.readdirSync(dir, { withFileTypes: true });
        for (const dirent of dirents) {
            let p = path_1.default.join(dir, dirent.name);
            if (dirent.isFile()) {
                if (dirent.name == basename) {
                    return filePath.replace(/\\/g, "/");
                }
                else {
                    if (reg.test(dirent.name)) {
                        return p.replace(/\\/g, "/");
                    }
                }
            }
        }
        return null;
    }
    static refreshAsset(path) {
        if (fs_1.default.statSync(path).isDirectory()) {
            let files = Utils.getAllFiles(path, null, true);
            for (const file of files) {
                Editor.Message.send("asset-db", "refresh-asset", this.toAssetDBUrl(file));
            }
        }
        else {
            Editor.Message.send("asset-db", "refresh-asset", this.toAssetDBUrl(path));
        }
    }
    static deleteAsset(path) {
        Editor.Message.send("asset-db", "delete-asset", this.toAssetDBUrl(path));
    }
    static toAssetDBUrl(path) {
        if (path.startsWith("db://"))
            return path;
        else
            return path.replace(this.ProjectPath + "/", "db://");
    }
    static toAbsolutePath(dbUrlOrprojUrl) {
        if (dbUrlOrprojUrl.startsWith("db://"))
            return dbUrlOrprojUrl.replace("db://", this.ProjectPath + "/");
        else if (dbUrlOrprojUrl.startsWith("project://"))
            return dbUrlOrprojUrl.replace("db://", this.ProjectPath + "/");
        else
            return dbUrlOrprojUrl;
    }
    static toUniSeparator(path) {
        return path.replace(/\\/g, "/");
    }
    static splitLines(content) {
        let result = [];
        let arr = content.split("\r\n");
        for (const str of arr) {
            let arr1 = str.split("\n");
            result.push(...arr1);
        }
        return result;
    }
    static get returnSymbol() {
        switch (os_1.default.platform()) {
            case 'win32': return '\r\n'; // windows
            default: return '\n';
        }
    }
}
exports.Utils = Utils;
