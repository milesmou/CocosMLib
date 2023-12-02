"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainJsCode = void 0;
class MainJsCode {
}
exports.MainJsCode = MainJsCode;
MainJsCode.code = `(function () {
        if (typeof window.jsb === 'object') {
            var hotUpdateSearchPaths = localStorage.getItem('<%version%>');
            if (hotUpdateSearchPaths) {
                var paths = JSON.parse(hotUpdateSearchPaths);
                jsb.fileUtils.setSearchPaths(paths);
    
                var fileList = [];
                var storagePath = paths[0] || '';
                var tempPath = storagePath + '_temp/';
                var baseOffset = tempPath.length;
    
                if (jsb.fileUtils.isDirectoryExist(tempPath) && !jsb.fileUtils.isFileExist(tempPath + 'project.manifest.temp')) {
                    jsb.fileUtils.listFilesRecursively(tempPath, fileList);
                    fileList.forEach(srcPath => {
                        var relativePath = srcPath.substr(baseOffset);
                        var dstPath = storagePath + relativePath;
    
                        if (srcPath[srcPath.length] == '/') {
                            cc.fileUtils.createDirectory(dstPath)
                        }
                        else {
                            if (cc.fileUtils.isFileExist(dstPath)) {
                                cc.fileUtils.removeFile(dstPath)
                            }
                            cc.fileUtils.renameFile(srcPath, dstPath);
                        }
                    })
                    cc.fileUtils.removeDirectory(tempPath);
                }
            }
        }
    })();`;
