const fs = require("fs-extra");
const path = require("path");


function getAllDirs(dir, filter, topDirOnly = false) {
    let dirs = [];
    if (!fs.existsSync(dir)) return dirs;
    let walkSync = (currentDir, callback) => {
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
            dirs.push(subDir.replace(/\//g,""));
        }
    });
    return dirs;
}

let dtrs = getAllDirs("E:/Workspace/RebornMan/program/trunk/RebornMan/assets",undefined,true);
console.log(dtrs);