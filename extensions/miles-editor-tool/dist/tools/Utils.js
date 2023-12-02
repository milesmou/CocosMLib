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
        return platform == "win32" || platform == "android" || platform == "ios";
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
    static getAllFiles(dir, suffix) {
        dir = this.toAbsolutePath(dir);
        suffix = suffix || [];
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
                    walkSync(p, callback);
                }
            });
        };
        walkSync(dir, file => {
            if (file.endsWith(".meta"))
                return;
            if (suffix.length == 0)
                files.push(this.toUniSeparator(file));
            let s = suffix.find(v => file.endsWith(v));
            if (s)
                files.push(this.toUniSeparator(file));
        });
        return files;
    }
    static refreshAsset(path) {
        Editor.Message.send("asset-db", "refresh-asset", this.toAssetDBUrl(path));
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
