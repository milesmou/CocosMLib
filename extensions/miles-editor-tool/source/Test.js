const fs = require("fs-extra");
const path = require("path");
const os = require("os");

/** 查找指定目录下的一个文件 */
function findFile(dir, filter, topDirOnly = false) {
    let filePath = null;
    if (!fs.existsSync(dir)) return filePath;
    let walkSync = (currentDir, callback) => {
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
            filePath = file;
            return true;
        }
        return false;
    });
    return filePath;
}

let dir = `E:/Workspace/NewCooking/program/trunk/NewCooking/assets`;

let ss = findFile(dir,v=>v.endsWith("main.scene"));

console.log(ss);
