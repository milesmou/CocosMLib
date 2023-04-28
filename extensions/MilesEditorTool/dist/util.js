"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.util = void 0;
const child_process_1 = __importDefault(require("child_process"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class util {
    static get ProjectPath() {
        if (!this.projectPath)
            this.projectPath = this.toUniSeparator(Editor.Project.path);
        return this.projectPath;
    }
    static exeCMD(workDir, cmd, onMsg, onError, onExit) {
        let result = child_process_1.default.spawn(cmd, { cwd: workDir });
        result.stdout.on("data", (data) => {
            let msg = data.toString();
            onMsg && onMsg(msg);
            if (msg == "Press any key to continue . . . ") {
                result.kill();
                onExit && onExit();
            }
        });
        result.stderr.on("data", (data) => {
            onError && onError(data.toString());
        });
    }
    static getAllFiles(dir, suffix) {
        dir = this.toAbsolutePath(dir);
        suffix = suffix || [];
        let files = [];
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
            if (suffix.length == 0)
                files.push(this.toUniSeparator(file));
            let s = suffix.find(v => file.endsWith(v));
            if (s)
                files.push(this.toUniSeparator(file));
        });
        return files;
    }
    static toAssetDBUrl(path) {
        if (path.startsWith("db://"))
            return path;
        else
            return path.replace(this.ProjectPath + "/", "db://");
    }
    static toAbsolutePath(dbUrl) {
        if (dbUrl.startsWith("db://"))
            return dbUrl.replace("db://", this.ProjectPath + "/");
        else
            return dbUrl;
    }
    static toUniSeparator(path) {
        return path.replace(/\\/g, "/");
    }
    static mkDirIfNotExists(dir) {
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir);
    }
}
exports.util = util;
