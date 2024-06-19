const fs = require("fs-extra");
const path = require("path");


/** 将追加了md5的文件路径还原为正常的文件路径 */
function restoreFilePath(filePath) {
    let ext = path.extname(filePath);
    let p = filePath.replace(ext, "");
    let reg = new RegExp(/.+\.[A-Za-z0-9]{5}/);
    if (reg.test(p)) {
        let index = p.lastIndexOf(".")
        return p.substring(0, index) + ext;
    } else {
        return filePath;
    }

}

let res = restoreFilePath("aaaats.sakjd.tt")

console.log(res);