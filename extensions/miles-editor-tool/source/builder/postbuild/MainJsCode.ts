export class MainJsCode {
    static insertCode = `(function () {
        if (typeof window.jsb === 'object') {
            var patchSearchPaths = localStorage.getItem('%version%');
            if (patchSearchPaths) {
                var paths = JSON.parse(patchSearchPaths);
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
}