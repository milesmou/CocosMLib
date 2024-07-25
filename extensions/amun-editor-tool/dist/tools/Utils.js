"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const child_process_1 = __importDefault(require("child_process"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Logger_1 = require("./Logger");
class Utils {
    static get ProjectPath() {
        if (!this.projectPath)
            this.projectPath = this.toUniSeparator(Editor.Project.path);
        return this.projectPath;
    }
    /** 是否原生平台 */
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
    /** 是否小游戏平台 */
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
    /** 执行终端命令 */
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
                    Logger_1.Logger.error(data.toString());
                }
                else {
                    Logger_1.Logger.error(data.toString());
                }
            });
            result.on("close", (code) => {
                resolve(code ? code : 0);
            });
        });
        return p;
    }
    /** 获取指定目录下所有文件 */
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
    /** 获取指定目录下所有目录 */
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
        let result = filePath;
        let dir = path_1.default.dirname(filePath);
        if (fs_1.default.existsSync(dir)) {
            let basename = path_1.default.basename(filePath);
            let ext = path_1.default.extname(filePath);
            let name = basename.replace(ext, ".");
            let reg = new RegExp(`${name}[A-Za-z0-9]{5}${ext}`);
            let dirents = fs_1.default.readdirSync(dir, { withFileTypes: true });
            for (const dirent of dirents) {
                let p = path_1.default.join(dir, dirent.name);
                if (dirent.isFile()) {
                    if (dirent.name == basename) {
                        break;
                    }
                    else {
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
    static restoreFilePath(filePath) {
        let ext = path_1.default.extname(filePath);
        let p = filePath.replace(ext, "");
        let reg = new RegExp(/.+\.[A-Za-z0-9]{5}/);
        if (reg.test(p)) {
            let index = p.lastIndexOf(".");
            return p.substring(0, index) + ext;
        }
        else {
            return filePath;
        }
    }
    /** 刷新编辑器内的资源 */
    static refreshAsset(path) {
        if (!path.startsWith("db:") && fs_1.default.statSync(path).isDirectory()) {
            let files = Utils.getAllFiles(path, null, true);
            for (const file of files) {
                Editor.Message.send("asset-db", "refresh-asset", this.toAssetDBUrl(file));
            }
        }
        else {
            Editor.Message.send("asset-db", "refresh-asset", this.toAssetDBUrl(path));
        }
    }
    /** 删除编辑器内的资源 */
    static deleteAsset(path) {
        Editor.Message.send("asset-db", "delete-asset", this.toAssetDBUrl(path));
    }
    /** 将本地文件路径转化为编辑器内资源路径 */
    static toAssetDBUrl(path) {
        if (path.startsWith("db://"))
            return path;
        else
            return path.replace(this.ProjectPath + "/", "db://");
    }
    /** 将编辑器内资源路径转化为本地文件路径 */
    static toAbsolutePath(dbUrlOrprojUrl) {
        if (dbUrlOrprojUrl.startsWith("db://"))
            return dbUrlOrprojUrl.replace("db://", this.ProjectPath + "/");
        else if (dbUrlOrprojUrl.startsWith("project://"))
            return dbUrlOrprojUrl.replace("db://", this.ProjectPath + "/");
        else
            return dbUrlOrprojUrl;
    }
    /** 统一路径分隔符为(/) */
    static toUniSeparator(path) {
        return path.replace(/\\/g, "/");
    }
    /** 统一换行符为(\n) */
    static toUniLineBrake(content) {
        return content.replace(/\\r\\n/g, "\n");
    }
}
exports.Utils = Utils;
