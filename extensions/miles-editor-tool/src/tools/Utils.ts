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
        return platform == "win32" || platform == "android" || platform == "ios";
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

    static getAllFiles(dir: string, suffix?: string[]) {
        dir = this.toAbsolutePath(dir);
        suffix = suffix || [];
        let files: string[] = [];
        if (!fs.existsSync(dir)) return files;
        let walkSync = (currentDir: string, callback: (filePath: string) => void) => {
            fs.readdirSync(currentDir, { withFileTypes: true }).forEach(dirent => {
                let p = path.join(currentDir, dirent.name);
                if (dirent.isFile()) {
                    callback(p);
                } else if (dirent.isDirectory()) {
                    walkSync(p, callback);
                }

            });
        };
        walkSync(dir, file => {
            if (file.endsWith(".meta")) return;
            if (suffix.length == 0) files.push(this.toUniSeparator(file));
            let s = suffix.find(v => file.endsWith(v));
            if (s) files.push(this.toUniSeparator(file));
        });
        return files;
    }

    static refreshAsset(path) {
        Editor.Message.send("asset-db", "refresh-asset", this.toAssetDBUrl(path));
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