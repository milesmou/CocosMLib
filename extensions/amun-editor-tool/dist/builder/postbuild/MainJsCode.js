"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainJsCode = void 0;
class MainJsCode {
}
exports.MainJsCode = MainJsCode;
MainJsCode.insertCode = `(function () {
        if (typeof window.jsb === 'object') {
            var hotUpdateSearchPaths = localStorage.getItem('HotUpdateSearchPaths');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbkpzQ29kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS9idWlsZGVyL3Bvc3RidWlsZC9NYWluSnNDb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQWEsVUFBVTs7QUFBdkIsZ0NBa0NDO0FBakNVLHFCQUFVLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VBZ0NkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgTWFpbkpzQ29kZSB7XG4gICAgc3RhdGljIGluc2VydENvZGUgPSBgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB3aW5kb3cuanNiID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdmFyIGhvdFVwZGF0ZVNlYXJjaFBhdGhzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ0hvdFVwZGF0ZVNlYXJjaFBhdGhzJyk7XG4gICAgICAgICAgICBpZiAoaG90VXBkYXRlU2VhcmNoUGF0aHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGF0aHMgPSBKU09OLnBhcnNlKGhvdFVwZGF0ZVNlYXJjaFBhdGhzKTtcbiAgICAgICAgICAgICAgICBqc2IuZmlsZVV0aWxzLnNldFNlYXJjaFBhdGhzKHBhdGhzKTtcbiAgICBcbiAgICAgICAgICAgICAgICB2YXIgZmlsZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB2YXIgc3RvcmFnZVBhdGggPSBwYXRoc1swXSB8fCAnJztcbiAgICAgICAgICAgICAgICB2YXIgdGVtcFBhdGggPSBzdG9yYWdlUGF0aCArICdfdGVtcC8nO1xuICAgICAgICAgICAgICAgIHZhciBiYXNlT2Zmc2V0ID0gdGVtcFBhdGgubGVuZ3RoO1xuICAgIFxuICAgICAgICAgICAgICAgIGlmIChqc2IuZmlsZVV0aWxzLmlzRGlyZWN0b3J5RXhpc3QodGVtcFBhdGgpICYmICFqc2IuZmlsZVV0aWxzLmlzRmlsZUV4aXN0KHRlbXBQYXRoICsgJ3Byb2plY3QubWFuaWZlc3QudGVtcCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGpzYi5maWxlVXRpbHMubGlzdEZpbGVzUmVjdXJzaXZlbHkodGVtcFBhdGgsIGZpbGVMaXN0KTtcbiAgICAgICAgICAgICAgICAgICAgZmlsZUxpc3QuZm9yRWFjaChzcmNQYXRoID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWxhdGl2ZVBhdGggPSBzcmNQYXRoLnN1YnN0cihiYXNlT2Zmc2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkc3RQYXRoID0gc3RvcmFnZVBhdGggKyByZWxhdGl2ZVBhdGg7XG4gICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3JjUGF0aFtzcmNQYXRoLmxlbmd0aF0gPT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2MuZmlsZVV0aWxzLmNyZWF0ZURpcmVjdG9yeShkc3RQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNjLmZpbGVVdGlscy5pc0ZpbGVFeGlzdChkc3RQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYy5maWxlVXRpbHMucmVtb3ZlRmlsZShkc3RQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYy5maWxlVXRpbHMucmVuYW1lRmlsZShzcmNQYXRoLCBkc3RQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgY2MuZmlsZVV0aWxzLnJlbW92ZURpcmVjdG9yeSh0ZW1wUGF0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSkoKTtgO1xufSJdfQ==