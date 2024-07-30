"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionGenerator = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Utils_1 = require("../tools/Utils");
class Manifest {
    constructor() {
        this.packageUrl = 'http://localhost/tutorial-hot-update/remote-assets/';
        this.remoteManifestUrl = 'http://localhost/tutorial-hot-update/remote-assets/project.manifest';
        this.remoteVersionUrl = 'http://localhost/tutorial-hot-update/remote-assets/version.manifest';
        this.version = '1.0.0';
        this.assets = {};
        this.searchPaths = [];
    }
}
class VersionGenerator {
    static gen(url, version, src, dest) {
        let manifest = new Manifest();
        manifest.packageUrl = url;
        manifest.remoteManifestUrl = url + '/project.manifest';
        manifest.remoteVersionUrl = url + '/version.manifest';
        manifest.version = version;
        this.src = src;
        this.dest = dest;
        fs_extra_1.default.emptyDirSync(dest);
        // 生成热更资源时,还原src目录下资源文件名 追加md5
        this.renameSrcFiles(path_1.default.join(src, 'src'));
        // Iterate assets and src folder
        this.readDir(path_1.default.join(src, 'src'), manifest.assets);
        this.readDir(path_1.default.join(src, 'assets'), manifest.assets);
        this.readDir(path_1.default.join(src, 'jsb-adapter'), manifest.assets);
        let destManifest = path_1.default.join(dest, 'project.manifest');
        let destVersion = path_1.default.join(dest, 'version.manifest');
        fs_extra_1.default.writeJSONSync(destManifest, manifest);
        delete manifest.assets;
        delete manifest.searchPaths;
        fs_extra_1.default.writeJSONSync(destVersion, manifest);
    }
    static renameSrcFiles(dir) {
        let files = Utils_1.Utils.getAllFiles(dir, null, true);
        files.forEach(file => {
            let fileName = path_1.default.basename(file);
            let ext = path_1.default.extname(file);
            let newFileName = fileName.replace(ext, "");
            let lastIndex = newFileName.lastIndexOf(".");
            if (lastIndex > -1 && newFileName != "system.bundle")
                return;
            let md5 = crypto_1.default.createHash('md5').update(fs_extra_1.default.readFileSync(file)).digest('hex');
            newFileName = newFileName + "." + md5.substring(0, 6);
            newFileName += ext;
            fs_extra_1.default.renameSync(file, file.replace(fileName, newFileName));
        });
    }
    static readDir(dir, obj) {
        try {
            let stat = fs_extra_1.default.statSync(dir);
            if (!stat.isDirectory()) {
                return;
            }
            let subpaths = fs_extra_1.default.readdirSync(dir), subpath, size, md5, compressed, relative;
            for (let i = 0; i < subpaths.length; ++i) {
                if (subpaths[i][0] === '.') {
                    continue;
                }
                subpath = path_1.default.join(dir, subpaths[i]);
                stat = fs_extra_1.default.statSync(subpath);
                if (stat.isDirectory()) {
                    this.readDir(subpath, obj);
                }
                else if (stat.isFile()) {
                    // Size in Bytes
                    size = stat['size'];
                    md5 = crypto_1.default.createHash('md5').update(fs_extra_1.default.readFileSync(subpath)).digest('hex');
                    compressed = path_1.default.extname(subpath).toLowerCase() === '.zip';
                    relative = subpath.replace(/\\/g, "/").replace(this.src + "/", "");
                    obj[relative] = {
                        'size': size,
                        'md5': md5
                    };
                    if (compressed) {
                        obj[relative].compressed = true;
                    }
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    }
}
exports.VersionGenerator = VersionGenerator;
VersionGenerator.dest = './remote-assets/';
VersionGenerator.src = './jsb/';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmVyc2lvbkdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NvdXJjZS9wb3N0YnVpbGQvVmVyc2lvbkdlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxvREFBNEI7QUFDNUIsd0RBQTBCO0FBQzFCLGdEQUF3QjtBQUN4QiwwQ0FBdUM7QUFFdkMsTUFBTSxRQUFRO0lBQWQ7UUFDSSxlQUFVLEdBQUcscURBQXFELENBQUM7UUFDbkUsc0JBQWlCLEdBQUcscUVBQXFFLENBQUM7UUFDMUYscUJBQWdCLEdBQUcscUVBQXFFLENBQUM7UUFDekYsWUFBTyxHQUFHLE9BQU8sQ0FBQztRQUNsQixXQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ1osZ0JBQVcsR0FBRyxFQUFFLENBQUM7SUFDckIsQ0FBQztDQUFBO0FBRUQsTUFBYSxnQkFBZ0I7SUFNbEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFXLEVBQUUsT0FBZSxFQUFFLEdBQVcsRUFBRSxJQUFZO1FBQ3JFLElBQUksUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7UUFFOUIsUUFBUSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUM7UUFDMUIsUUFBUSxDQUFDLGlCQUFpQixHQUFHLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQztRQUN2RCxRQUFRLENBQUMsZ0JBQWdCLEdBQUcsR0FBRyxHQUFHLG1CQUFtQixDQUFDO1FBQ3RELFFBQVEsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQzNCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFHakIsa0JBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEIsOEJBQThCO1FBQzlCLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUUzQyxnQ0FB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QyxHQUFHLENBQUMsQ0FBQTtTQUNyQjtJQUNMLENBQUM7O0FBdEZMLDRDQXlGQztBQXRGa0IscUJBQUksR0FBRyxrQkFBa0IsQ0FBQztBQUMxQixvQkFBRyxHQUFHLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjcnlwdG8gZnJvbSBcImNyeXB0b1wiO1xyXG5pbXBvcnQgZnMgZnJvbSBcImZzLWV4dHJhXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IFV0aWxzIH0gZnJvbSBcIi4uL3Rvb2xzL1V0aWxzXCI7XHJcblxyXG5jbGFzcyBNYW5pZmVzdCB7XHJcbiAgICBwYWNrYWdlVXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3QvdHV0b3JpYWwtaG90LXVwZGF0ZS9yZW1vdGUtYXNzZXRzLyc7XHJcbiAgICByZW1vdGVNYW5pZmVzdFVybCA9ICdodHRwOi8vbG9jYWxob3N0L3R1dG9yaWFsLWhvdC11cGRhdGUvcmVtb3RlLWFzc2V0cy9wcm9qZWN0Lm1hbmlmZXN0JztcclxuICAgIHJlbW90ZVZlcnNpb25VcmwgPSAnaHR0cDovL2xvY2FsaG9zdC90dXRvcmlhbC1ob3QtdXBkYXRlL3JlbW90ZS1hc3NldHMvdmVyc2lvbi5tYW5pZmVzdCc7XHJcbiAgICB2ZXJzaW9uID0gJzEuMC4wJztcclxuICAgIGFzc2V0cyA9IHt9O1xyXG4gICAgc2VhcmNoUGF0aHMgPSBbXTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFZlcnNpb25HZW5lcmF0b3Ige1xyXG5cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBkZXN0ID0gJy4vcmVtb3RlLWFzc2V0cy8nO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgc3JjID0gJy4vanNiLyc7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZW4odXJsOiBzdHJpbmcsIHZlcnNpb246IHN0cmluZywgc3JjOiBzdHJpbmcsIGRlc3Q6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBtYW5pZmVzdCA9IG5ldyBNYW5pZmVzdCgpO1xyXG5cclxuICAgICAgICBtYW5pZmVzdC5wYWNrYWdlVXJsID0gdXJsO1xyXG4gICAgICAgIG1hbmlmZXN0LnJlbW90ZU1hbmlmZXN0VXJsID0gdXJsICsgJy9wcm9qZWN0Lm1hbmlmZXN0JztcclxuICAgICAgICBtYW5pZmVzdC5yZW1vdGVWZXJzaW9uVXJsID0gdXJsICsgJy92ZXJzaW9uLm1hbmlmZXN0JztcclxuICAgICAgICBtYW5pZmVzdC52ZXJzaW9uID0gdmVyc2lvbjtcclxuICAgICAgICB0aGlzLnNyYyA9IHNyYztcclxuICAgICAgICB0aGlzLmRlc3QgPSBkZXN0O1xyXG5cclxuXHJcbiAgICAgICAgZnMuZW1wdHlEaXJTeW5jKGRlc3QpO1xyXG4gICAgICAgIC8vIOeUn+aIkOeDreabtOi1hOa6kOaXtizov5jljp9zcmPnm67lvZXkuIvotYTmupDmlofku7blkI0g6L+95YqgbWQ1XHJcbiAgICAgICAgdGhpcy5yZW5hbWVTcmNGaWxlcyhwYXRoLmpvaW4oc3JjLCAnc3JjJykpO1xyXG5cclxuICAgICAgICAvLyBJdGVyYXRlIGFzc2V0cyBhbmQgc3JjIGZvbGRlclxyXG4gICAgICAgIHRoaXMucmVhZERpcihwYXRoLmpvaW4oc3JjLCAnc3JjJyksIG1hbmlmZXN0LmFzc2V0cyk7XHJcbiAgICAgICAgdGhpcy5yZWFkRGlyKHBhdGguam9pbihzcmMsICdhc3NldHMnKSwgbWFuaWZlc3QuYXNzZXRzKTtcclxuICAgICAgICB0aGlzLnJlYWREaXIocGF0aC5qb2luKHNyYywgJ2pzYi1hZGFwdGVyJyksIG1hbmlmZXN0LmFzc2V0cyk7XHJcblxyXG4gICAgICAgIGxldCBkZXN0TWFuaWZlc3QgPSBwYXRoLmpvaW4oZGVzdCwgJ3Byb2plY3QubWFuaWZlc3QnKTtcclxuICAgICAgICBsZXQgZGVzdFZlcnNpb24gPSBwYXRoLmpvaW4oZGVzdCwgJ3ZlcnNpb24ubWFuaWZlc3QnKTtcclxuXHJcbiAgICAgICAgZnMud3JpdGVKU09OU3luYyhkZXN0TWFuaWZlc3QsIG1hbmlmZXN0KTtcclxuXHJcbiAgICAgICAgZGVsZXRlIG1hbmlmZXN0LmFzc2V0cztcclxuICAgICAgICBkZWxldGUgbWFuaWZlc3Quc2VhcmNoUGF0aHM7XHJcbiAgICAgICAgZnMud3JpdGVKU09OU3luYyhkZXN0VmVyc2lvbiwgbWFuaWZlc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlbmFtZVNyY0ZpbGVzKGRpcjogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IGZpbGVzID0gVXRpbHMuZ2V0QWxsRmlsZXMoZGlyLCBudWxsLCB0cnVlKTtcclxuICAgICAgICBmaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGUpO1xyXG4gICAgICAgICAgICBsZXQgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGUpO1xyXG4gICAgICAgICAgICBsZXQgbmV3RmlsZU5hbWUgPSBmaWxlTmFtZS5yZXBsYWNlKGV4dCwgXCJcIik7XHJcbiAgICAgICAgICAgIGxldCBsYXN0SW5kZXggPSBuZXdGaWxlTmFtZS5sYXN0SW5kZXhPZihcIi5cIik7XHJcbiAgICAgICAgICAgIGlmIChsYXN0SW5kZXggPiAtMSAmJiBuZXdGaWxlTmFtZSAhPSBcInN5c3RlbS5idW5kbGVcIikgcmV0dXJuO1xyXG4gICAgICAgICAgICBsZXQgbWQ1ID0gY3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpLnVwZGF0ZShmcy5yZWFkRmlsZVN5bmMoZmlsZSkpLmRpZ2VzdCgnaGV4Jyk7XHJcbiAgICAgICAgICAgIG5ld0ZpbGVOYW1lID0gbmV3RmlsZU5hbWUgKyBcIi5cIiArIG1kNS5zdWJzdHJpbmcoMCwgNik7XHJcbiAgICAgICAgICAgIG5ld0ZpbGVOYW1lICs9IGV4dDtcclxuICAgICAgICAgICAgZnMucmVuYW1lU3luYyhmaWxlLCBmaWxlLnJlcGxhY2UoZmlsZU5hbWUsIG5ld0ZpbGVOYW1lKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZERpcihkaXIsIG9iaikge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBzdGF0ID0gZnMuc3RhdFN5bmMoZGlyKTtcclxuICAgICAgICAgICAgaWYgKCFzdGF0LmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgc3VicGF0aHMgPSBmcy5yZWFkZGlyU3luYyhkaXIpLCBzdWJwYXRoLCBzaXplLCBtZDUsIGNvbXByZXNzZWQsIHJlbGF0aXZlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1YnBhdGhzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3VicGF0aHNbaV1bMF0gPT09ICcuJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc3VicGF0aCA9IHBhdGguam9pbihkaXIsIHN1YnBhdGhzW2ldKTtcclxuICAgICAgICAgICAgICAgIHN0YXQgPSBmcy5zdGF0U3luYyhzdWJwYXRoKTtcclxuICAgICAgICAgICAgICAgIGlmIChzdGF0LmlzRGlyZWN0b3J5KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWREaXIoc3VicGF0aCwgb2JqKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQuaXNGaWxlKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTaXplIGluIEJ5dGVzXHJcbiAgICAgICAgICAgICAgICAgICAgc2l6ZSA9IHN0YXRbJ3NpemUnXTtcclxuICAgICAgICAgICAgICAgICAgICBtZDUgPSBjcnlwdG8uY3JlYXRlSGFzaCgnbWQ1JykudXBkYXRlKGZzLnJlYWRGaWxlU3luYyhzdWJwYXRoKSkuZGlnZXN0KCdoZXgnKTtcclxuICAgICAgICAgICAgICAgICAgICBjb21wcmVzc2VkID0gcGF0aC5leHRuYW1lKHN1YnBhdGgpLnRvTG93ZXJDYXNlKCkgPT09ICcuemlwJztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmUgPSBzdWJwYXRoLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpLnJlcGxhY2UodGhpcy5zcmMgKyBcIi9cIiwgXCJcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgb2JqW3JlbGF0aXZlXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemUnOiBzaXplLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnbWQ1JzogbWQ1XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcHJlc3NlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpbcmVsYXRpdmVdLmNvbXByZXNzZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycilcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxufSJdfQ==