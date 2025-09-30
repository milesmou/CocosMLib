import fs from "fs-extra";
import path from "path";



/** 获取指定目录下所有目录 */
function getAllDirs(dir: string, filter?: (dir: string) => boolean, topDirOnly = false) {
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
            dirs.push(subDir);
        }
    });
    return dirs;
}
let dir = "E:/Workspace/NewCooking/program/trunk/NewCooking/assets/bundles";

let dirs = getAllDirs(dir,null);
for (const d of dirs) {
    console.log(d);
    
}