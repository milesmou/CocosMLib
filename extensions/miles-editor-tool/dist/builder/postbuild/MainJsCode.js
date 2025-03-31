"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainJsCode = void 0;
class MainJsCode {
}
exports.MainJsCode = MainJsCode;
MainJsCode.insertCode = `(function () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbkpzQ29kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS9idWlsZGVyL3Bvc3RidWlsZC9NYWluSnNDb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQWEsVUFBVTs7QUFBdkIsZ0NBa0NDO0FBakNVLHFCQUFVLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBZ0NkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgTWFpbkpzQ29kZSB7XG4gICAgc3RhdGljIGluc2VydENvZGUgPSBgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuanNiID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdmFyIHBhdGNoU2VhcmNoUGF0aHMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnJXZlcnNpb24lJyk7XG4gICAgICAgICAgICBpZiAocGF0Y2hTZWFyY2hQYXRocykge1xuICAgICAgICAgICAgICAgIHZhciBwYXRocyA9IEpTT04ucGFyc2UocGF0Y2hTZWFyY2hQYXRocyk7XG4gICAgICAgICAgICAgICAganNiLmZpbGVVdGlscy5zZXRTZWFyY2hQYXRocyhwYXRocyk7XG4gICAgXG4gICAgICAgICAgICAgICAgdmFyIGZpbGVMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgdmFyIHN0b3JhZ2VQYXRoID0gcGF0aHNbMF0gfHwgJyc7XG4gICAgICAgICAgICAgICAgdmFyIHRlbXBQYXRoID0gc3RvcmFnZVBhdGggKyAnX3RlbXAvJztcbiAgICAgICAgICAgICAgICB2YXIgYmFzZU9mZnNldCA9IHRlbXBQYXRoLmxlbmd0aDtcbiAgICBcbiAgICAgICAgICAgICAgICBpZiAoanNiLmZpbGVVdGlscy5pc0RpcmVjdG9yeUV4aXN0KHRlbXBQYXRoKSAmJiAhanNiLmZpbGVVdGlscy5pc0ZpbGVFeGlzdCh0ZW1wUGF0aCArICdwcm9qZWN0Lm1hbmlmZXN0LnRlbXAnKSkge1xuICAgICAgICAgICAgICAgICAgICBqc2IuZmlsZVV0aWxzLmxpc3RGaWxlc1JlY3Vyc2l2ZWx5KHRlbXBQYXRoLCBmaWxlTGlzdCk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVMaXN0LmZvckVhY2goc3JjUGF0aCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVsYXRpdmVQYXRoID0gc3JjUGF0aC5zdWJzdHIoYmFzZU9mZnNldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHN0UGF0aCA9IHN0b3JhZ2VQYXRoICsgcmVsYXRpdmVQYXRoO1xuICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNyY1BhdGhbc3JjUGF0aC5sZW5ndGhdID09ICcvJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNjLmZpbGVVdGlscy5jcmVhdGVEaXJlY3RvcnkoZHN0UGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYy5maWxlVXRpbHMuaXNGaWxlRXhpc3QoZHN0UGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2MuZmlsZVV0aWxzLnJlbW92ZUZpbGUoZHN0UGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2MuZmlsZVV0aWxzLnJlbmFtZUZpbGUoc3JjUGF0aCwgZHN0UGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIGNjLmZpbGVVdGlscy5yZW1vdmVEaXJlY3RvcnkodGVtcFBhdGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pKCk7YDtcbn0iXX0=