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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbkpzQ29kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS9wb3N0YnVpbGQvTWFpbkpzQ29kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFhLFVBQVU7O0FBQXZCLGdDQWtDQztBQWpDVSxlQUFJLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBZ0NSLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgTWFpbkpzQ29kZSB7XHJcbiAgICBzdGF0aWMgY29kZSA9IGAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93LmpzYiA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgdmFyIGhvdFVwZGF0ZVNlYXJjaFBhdGhzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJzwldmVyc2lvbiU+Jyk7XHJcbiAgICAgICAgICAgIGlmIChob3RVcGRhdGVTZWFyY2hQYXRocykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHBhdGhzID0gSlNPTi5wYXJzZShob3RVcGRhdGVTZWFyY2hQYXRocyk7XHJcbiAgICAgICAgICAgICAgICBqc2IuZmlsZVV0aWxzLnNldFNlYXJjaFBhdGhzKHBhdGhzKTtcclxuICAgIFxyXG4gICAgICAgICAgICAgICAgdmFyIGZpbGVMaXN0ID0gW107XHJcbiAgICAgICAgICAgICAgICB2YXIgc3RvcmFnZVBhdGggPSBwYXRoc1swXSB8fCAnJztcclxuICAgICAgICAgICAgICAgIHZhciB0ZW1wUGF0aCA9IHN0b3JhZ2VQYXRoICsgJ190ZW1wLyc7XHJcbiAgICAgICAgICAgICAgICB2YXIgYmFzZU9mZnNldCA9IHRlbXBQYXRoLmxlbmd0aDtcclxuICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKGpzYi5maWxlVXRpbHMuaXNEaXJlY3RvcnlFeGlzdCh0ZW1wUGF0aCkgJiYgIWpzYi5maWxlVXRpbHMuaXNGaWxlRXhpc3QodGVtcFBhdGggKyAncHJvamVjdC5tYW5pZmVzdC50ZW1wJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBqc2IuZmlsZVV0aWxzLmxpc3RGaWxlc1JlY3Vyc2l2ZWx5KHRlbXBQYXRoLCBmaWxlTGlzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZUxpc3QuZm9yRWFjaChzcmNQYXRoID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlbGF0aXZlUGF0aCA9IHNyY1BhdGguc3Vic3RyKGJhc2VPZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHN0UGF0aCA9IHN0b3JhZ2VQYXRoICsgcmVsYXRpdmVQYXRoO1xyXG4gICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzcmNQYXRoW3NyY1BhdGgubGVuZ3RoXSA9PSAnLycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNjLmZpbGVVdGlscy5jcmVhdGVEaXJlY3RvcnkoZHN0UGF0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYy5maWxlVXRpbHMuaXNGaWxlRXhpc3QoZHN0UGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYy5maWxlVXRpbHMucmVtb3ZlRmlsZShkc3RQYXRoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2MuZmlsZVV0aWxzLnJlbmFtZUZpbGUoc3JjUGF0aCwgZHN0UGF0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIGNjLmZpbGVVdGlscy5yZW1vdmVEaXJlY3RvcnkodGVtcFBhdGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSkoKTtgO1xyXG59Il19