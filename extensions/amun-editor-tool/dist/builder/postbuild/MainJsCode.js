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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbkpzQ29kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS9idWlsZGVyL3Bvc3RidWlsZC9NYWluSnNDb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQWEsVUFBVTs7QUFBdkIsZ0NBa0NDO0FBakNVLGVBQUksR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFnQ1IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBNYWluSnNDb2RlIHtcbiAgICBzdGF0aWMgY29kZSA9IGAoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5qc2IgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICB2YXIgaG90VXBkYXRlU2VhcmNoUGF0aHMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnPCV2ZXJzaW9uJT4nKTtcbiAgICAgICAgICAgIGlmIChob3RVcGRhdGVTZWFyY2hQYXRocykge1xuICAgICAgICAgICAgICAgIHZhciBwYXRocyA9IEpTT04ucGFyc2UoaG90VXBkYXRlU2VhcmNoUGF0aHMpO1xuICAgICAgICAgICAgICAgIGpzYi5maWxlVXRpbHMuc2V0U2VhcmNoUGF0aHMocGF0aHMpO1xuICAgIFxuICAgICAgICAgICAgICAgIHZhciBmaWxlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIHZhciBzdG9yYWdlUGF0aCA9IHBhdGhzWzBdIHx8ICcnO1xuICAgICAgICAgICAgICAgIHZhciB0ZW1wUGF0aCA9IHN0b3JhZ2VQYXRoICsgJ190ZW1wLyc7XG4gICAgICAgICAgICAgICAgdmFyIGJhc2VPZmZzZXQgPSB0ZW1wUGF0aC5sZW5ndGg7XG4gICAgXG4gICAgICAgICAgICAgICAgaWYgKGpzYi5maWxlVXRpbHMuaXNEaXJlY3RvcnlFeGlzdCh0ZW1wUGF0aCkgJiYgIWpzYi5maWxlVXRpbHMuaXNGaWxlRXhpc3QodGVtcFBhdGggKyAncHJvamVjdC5tYW5pZmVzdC50ZW1wJykpIHtcbiAgICAgICAgICAgICAgICAgICAganNiLmZpbGVVdGlscy5saXN0RmlsZXNSZWN1cnNpdmVseSh0ZW1wUGF0aCwgZmlsZUxpc3QpO1xuICAgICAgICAgICAgICAgICAgICBmaWxlTGlzdC5mb3JFYWNoKHNyY1BhdGggPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlbGF0aXZlUGF0aCA9IHNyY1BhdGguc3Vic3RyKGJhc2VPZmZzZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRzdFBhdGggPSBzdG9yYWdlUGF0aCArIHJlbGF0aXZlUGF0aDtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzcmNQYXRoW3NyY1BhdGgubGVuZ3RoXSA9PSAnLycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYy5maWxlVXRpbHMuY3JlYXRlRGlyZWN0b3J5KGRzdFBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2MuZmlsZVV0aWxzLmlzRmlsZUV4aXN0KGRzdFBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNjLmZpbGVVdGlscy5yZW1vdmVGaWxlKGRzdFBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNjLmZpbGVVdGlscy5yZW5hbWVGaWxlKHNyY1BhdGgsIGRzdFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBjYy5maWxlVXRpbHMucmVtb3ZlRGlyZWN0b3J5KHRlbXBQYXRoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KSgpO2A7XG59Il19