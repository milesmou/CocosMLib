"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainJsCode = void 0;
class MainJsCode {
}
exports.MainJsCode = MainJsCode;
MainJsCode.insertCode = `// 在 main.js 的开头添加如下代码
(function () {
    if (typeof window.jsb === 'object') {
        var hotUpdateSearchPaths = localStorage.getItem('%version%');
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
                        jsb.fileUtils.createDirectory(dstPath)
                    }
                    else {
                        if (jsb.fileUtils.isFileExist(dstPath)) {
                            jsb.fileUtils.removeFile(dstPath)
                        }
                        jsb.fileUtils.renameFile(srcPath, dstPath);
                    }
                })
                jsb.fileUtils.removeDirectory(tempPath);
            }
        }
    }
})();`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbkpzQ29kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS9idWlsZGVyL3Bvc3RidWlsZC9NYWluSnNDb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQWEsVUFBVTs7QUFBdkIsZ0NBbUNDO0FBbENXLHFCQUFVLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQWlDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBNYWluSnNDb2RlIHtcbiAgICAgc3RhdGljIGluc2VydENvZGUgPSBgLy8g5ZyoIG1haW4uanMg55qE5byA5aS05re75Yqg5aaC5LiL5Luj56CBXG4oZnVuY3Rpb24gKCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93LmpzYiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdmFyIGhvdFVwZGF0ZVNlYXJjaFBhdGhzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJyV2ZXJzaW9uJScpO1xuICAgICAgICBpZiAoaG90VXBkYXRlU2VhcmNoUGF0aHMpIHtcbiAgICAgICAgICAgIHZhciBwYXRocyA9IEpTT04ucGFyc2UoaG90VXBkYXRlU2VhcmNoUGF0aHMpO1xuICAgICAgICAgICAganNiLmZpbGVVdGlscy5zZXRTZWFyY2hQYXRocyhwYXRocyk7XG5cbiAgICAgICAgICAgIHZhciBmaWxlTGlzdCA9IFtdO1xuICAgICAgICAgICAgdmFyIHN0b3JhZ2VQYXRoID0gcGF0aHNbMF0gfHwgJyc7XG4gICAgICAgICAgICB2YXIgdGVtcFBhdGggPSBzdG9yYWdlUGF0aCArICdfdGVtcC8nO1xuICAgICAgICAgICAgdmFyIGJhc2VPZmZzZXQgPSB0ZW1wUGF0aC5sZW5ndGg7XG5cbiAgICAgICAgICAgIGlmIChqc2IuZmlsZVV0aWxzLmlzRGlyZWN0b3J5RXhpc3QodGVtcFBhdGgpICYmICFqc2IuZmlsZVV0aWxzLmlzRmlsZUV4aXN0KHRlbXBQYXRoICsgJ3Byb2plY3QubWFuaWZlc3QudGVtcCcpKSB7XG4gICAgICAgICAgICAgICAganNiLmZpbGVVdGlscy5saXN0RmlsZXNSZWN1cnNpdmVseSh0ZW1wUGF0aCwgZmlsZUxpc3QpO1xuICAgICAgICAgICAgICAgIGZpbGVMaXN0LmZvckVhY2goc3JjUGF0aCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZWxhdGl2ZVBhdGggPSBzcmNQYXRoLnN1YnN0cihiYXNlT2Zmc2V0KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRzdFBhdGggPSBzdG9yYWdlUGF0aCArIHJlbGF0aXZlUGF0aDtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc3JjUGF0aFtzcmNQYXRoLmxlbmd0aF0gPT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBqc2IuZmlsZVV0aWxzLmNyZWF0ZURpcmVjdG9yeShkc3RQYXRoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzYi5maWxlVXRpbHMuaXNGaWxlRXhpc3QoZHN0UGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqc2IuZmlsZVV0aWxzLnJlbW92ZUZpbGUoZHN0UGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGpzYi5maWxlVXRpbHMucmVuYW1lRmlsZShzcmNQYXRoLCBkc3RQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAganNiLmZpbGVVdGlscy5yZW1vdmVEaXJlY3RvcnkodGVtcFBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSkoKTtgO1xufSJdfQ==