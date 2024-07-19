import child_process from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { Logger } from "./Logger";
export class Utils {

    private static projectPath: string;
    static get ProjectPath() {
        if (!this.projectPath) this.projectPath = this.toUniSeparator(Editor.Project.path);
        return this.projectPath;
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

    static fixupFilePath(filePath: string) {
        if (filePath.endsWith(".tpl")) filePath = filePath.replace(".tpl", "");
        let result = "";
        let dir = path.dirname(filePath);
        let extname = path.extname(filePath);
        let basename = path.basename(filePath, extname) + ".";
        let arr = fs.readdirSync(dir, { withFileTypes: true });
        for (const dirent of arr) {
            if (dirent.isFile()) {
                let name = dirent.name;
                let p = path.join(dir, name);
                if (name.startsWith(basename) && name.endsWith(extname)) {
                    result = this.toUniSeparator(p);
                    break;
                }
            }
        }
        if (!result) result = filePath;
        return result;
    }

    static refreshAsset(path) {
        let dbUrl = this.toAssetDBUrl(path);
        Editor.Message.send("asset-db", "refresh-asset", dbUrl);
    }

    static toAssetDBUrl(path: string) {
        if (path.startsWith("db://")) return path;
        else return path.replace(this.ProjectPath + "/", "db://");
    }

    static toAbsolutePath(dbUrl: string) {
        if (dbUrl.startsWith("db://")) return dbUrl.replace("db://", this.ProjectPath + "/");
        else return dbUrl;
    }

    static toUniSeparator(path: string) {
        return path.replace(/\\/g, "/");
    }

    static lowerFirst(source: string) {
        if (!source) return source;
        if (source.length < 2) return source.toLowerCase();
        return source[0].toLowerCase() + source.substring(1);
    }

    static get returnSymbol() {
        switch (os.platform()) {
            case 'win32': return '\r\n' // windows
            default: return '\n'
        }
    }

}