const fs = require("fs-extra");
const path = require("path");


/** 根据文件路径找到追加了md5值的实际文件路径 */
function resolveFilePath(filePath) {
    let dir = path.dirname(filePath);
    let basename = path.basename(filePath);
    let ext = path.extname(filePath);
    let name = basename.replace(ext, ".");
    let reg = new RegExp(`${name}[A-Za-z0-9]{5}${ext}`);
    let dirents = fs.readdirSync(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        let p = path.join(dir, dirent.name);
        if (dirent.isFile()) {
            if (dirent.name == basename) {
                return filePath;
            } else {
                if (reg.test(dirent.name)) {
                    return p;
                }
            }
        }
    }
    return null;
}


let f = resolveFilePath("E:/Workspace/RebornMan/program/trunk/RebornMan/build/kuaishou/application.js");

console.log(f);