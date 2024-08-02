"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionGenerator = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Utils_1 = require("../../tools/Utils");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmVyc2lvbkdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS9idWlsZGVyL3Bvc3RidWlsZC9WZXJzaW9uR2VuZXJhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG9EQUE0QjtBQUM1Qix3REFBMEI7QUFDMUIsZ0RBQXdCO0FBQ3hCLDZDQUEwQztBQUUxQyxNQUFNLFFBQVE7SUFBZDtRQUNJLGVBQVUsR0FBRyxxREFBcUQsQ0FBQztRQUNuRSxzQkFBaUIsR0FBRyxxRUFBcUUsQ0FBQztRQUMxRixxQkFBZ0IsR0FBRyxxRUFBcUUsQ0FBQztRQUN6RixZQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ2xCLFdBQU0sR0FBRyxFQUFFLENBQUM7UUFDWixnQkFBVyxHQUFHLEVBQUUsQ0FBQztJQUNyQixDQUFDO0NBQUE7QUFFRCxNQUFhLGdCQUFnQjtJQU1sQixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsR0FBVyxFQUFFLElBQVk7UUFDckUsSUFBSSxRQUFRLEdBQUcsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUU5QixRQUFRLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztRQUMxQixRQUFRLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxHQUFHLG1CQUFtQixDQUFDO1FBQ3ZELFFBQVEsQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLEdBQUcsbUJBQW1CLENBQUM7UUFDdEQsUUFBUSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDM0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUdqQixrQkFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0Qiw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFD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QUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQ3JCO0lBQ0wsQ0FBQzs7QUF0RkwsNENBeUZDO0FBdEZrQixxQkFBSSxHQUFHLGtCQUFrQixDQUFDO0FBQzFCLG9CQUFHLEdBQUcsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNyeXB0byBmcm9tIFwiY3J5cHRvXCI7XG5pbXBvcnQgZnMgZnJvbSBcImZzLWV4dHJhXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgVXRpbHMgfSBmcm9tIFwiLi4vLi4vdG9vbHMvVXRpbHNcIjtcblxuY2xhc3MgTWFuaWZlc3Qge1xuICAgIHBhY2thZ2VVcmwgPSAnaHR0cDovL2xvY2FsaG9zdC90dXRvcmlhbC1ob3QtdXBkYXRlL3JlbW90ZS1hc3NldHMvJztcbiAgICByZW1vdGVNYW5pZmVzdFVybCA9ICdodHRwOi8vbG9jYWxob3N0L3R1dG9yaWFsLWhvdC11cGRhdGUvcmVtb3RlLWFzc2V0cy9wcm9qZWN0Lm1hbmlmZXN0JztcbiAgICByZW1vdGVWZXJzaW9uVXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3QvdHV0b3JpYWwtaG90LXVwZGF0ZS9yZW1vdGUtYXNzZXRzL3ZlcnNpb24ubWFuaWZlc3QnO1xuICAgIHZlcnNpb24gPSAnMS4wLjAnO1xuICAgIGFzc2V0cyA9IHt9O1xuICAgIHNlYXJjaFBhdGhzID0gW107XG59XG5cbmV4cG9ydCBjbGFzcyBWZXJzaW9uR2VuZXJhdG9yIHtcblxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZGVzdCA9ICcuL3JlbW90ZS1hc3NldHMvJztcbiAgICBwcml2YXRlIHN0YXRpYyBzcmMgPSAnLi9qc2IvJztcblxuICAgIHB1YmxpYyBzdGF0aWMgZ2VuKHVybDogc3RyaW5nLCB2ZXJzaW9uOiBzdHJpbmcsIHNyYzogc3RyaW5nLCBkZXN0OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IG1hbmlmZXN0ID0gbmV3IE1hbmlmZXN0KCk7XG5cbiAgICAgICAgbWFuaWZlc3QucGFja2FnZVVybCA9IHVybDtcbiAgICAgICAgbWFuaWZlc3QucmVtb3RlTWFuaWZlc3RVcmwgPSB1cmwgKyAnL3Byb2plY3QubWFuaWZlc3QnO1xuICAgICAgICBtYW5pZmVzdC5yZW1vdGVWZXJzaW9uVXJsID0gdXJsICsgJy92ZXJzaW9uLm1hbmlmZXN0JztcbiAgICAgICAgbWFuaWZlc3QudmVyc2lvbiA9IHZlcnNpb247XG4gICAgICAgIHRoaXMuc3JjID0gc3JjO1xuICAgICAgICB0aGlzLmRlc3QgPSBkZXN0O1xuXG5cbiAgICAgICAgZnMuZW1wdHlEaXJTeW5jKGRlc3QpO1xuICAgICAgICAvLyDnlJ/miJDng63mm7TotYTmupDml7Ys6L+Y5Y6fc3Jj55uu5b2V5LiL6LWE5rqQ5paH5Lu25ZCNIOi/veWKoG1kNVxuICAgICAgICB0aGlzLnJlbmFtZVNyY0ZpbGVzKHBhdGguam9pbihzcmMsICdzcmMnKSk7XG5cbiAgICAgICAgLy8gSXRlcmF0ZSBhc3NldHMgYW5kIHNyYyBmb2xkZXJcbiAgICAgICAgdGhpcy5yZWFkRGlyKHBhdGguam9pbihzcmMsICdzcmMnKSwgbWFuaWZlc3QuYXNzZXRzKTtcbiAgICAgICAgdGhpcy5yZWFkRGlyKHBhdGguam9pbihzcmMsICdhc3NldHMnKSwgbWFuaWZlc3QuYXNzZXRzKTtcbiAgICAgICAgdGhpcy5yZWFkRGlyKHBhdGguam9pbihzcmMsICdqc2ItYWRhcHRlcicpLCBtYW5pZmVzdC5hc3NldHMpO1xuXG4gICAgICAgIGxldCBkZXN0TWFuaWZlc3QgPSBwYXRoLmpvaW4oZGVzdCwgJ3Byb2plY3QubWFuaWZlc3QnKTtcbiAgICAgICAgbGV0IGRlc3RWZXJzaW9uID0gcGF0aC5qb2luKGRlc3QsICd2ZXJzaW9uLm1hbmlmZXN0Jyk7XG5cbiAgICAgICAgZnMud3JpdGVKU09OU3luYyhkZXN0TWFuaWZlc3QsIG1hbmlmZXN0KTtcblxuICAgICAgICBkZWxldGUgbWFuaWZlc3QuYXNzZXRzO1xuICAgICAgICBkZWxldGUgbWFuaWZlc3Quc2VhcmNoUGF0aHM7XG4gICAgICAgIGZzLndyaXRlSlNPTlN5bmMoZGVzdFZlcnNpb24sIG1hbmlmZXN0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyByZW5hbWVTcmNGaWxlcyhkaXI6IHN0cmluZykge1xuICAgICAgICBsZXQgZmlsZXMgPSBVdGlscy5nZXRBbGxGaWxlcyhkaXIsIG51bGwsIHRydWUpO1xuICAgICAgICBmaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlKTtcbiAgICAgICAgICAgIGxldCBleHQgPSBwYXRoLmV4dG5hbWUoZmlsZSk7XG4gICAgICAgICAgICBsZXQgbmV3RmlsZU5hbWUgPSBmaWxlTmFtZS5yZXBsYWNlKGV4dCwgXCJcIik7XG4gICAgICAgICAgICBsZXQgbGFzdEluZGV4ID0gbmV3RmlsZU5hbWUubGFzdEluZGV4T2YoXCIuXCIpO1xuICAgICAgICAgICAgaWYgKGxhc3RJbmRleCA+IC0xICYmIG5ld0ZpbGVOYW1lICE9IFwic3lzdGVtLmJ1bmRsZVwiKSByZXR1cm47XG4gICAgICAgICAgICBsZXQgbWQ1ID0gY3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpLnVwZGF0ZShmcy5yZWFkRmlsZVN5bmMoZmlsZSkpLmRpZ2VzdCgnaGV4Jyk7XG4gICAgICAgICAgICBuZXdGaWxlTmFtZSA9IG5ld0ZpbGVOYW1lICsgXCIuXCIgKyBtZDUuc3Vic3RyaW5nKDAsIDYpO1xuICAgICAgICAgICAgbmV3RmlsZU5hbWUgKz0gZXh0O1xuICAgICAgICAgICAgZnMucmVuYW1lU3luYyhmaWxlLCBmaWxlLnJlcGxhY2UoZmlsZU5hbWUsIG5ld0ZpbGVOYW1lKSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIHJlYWREaXIoZGlyLCBvYmopIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBzdGF0ID0gZnMuc3RhdFN5bmMoZGlyKTtcbiAgICAgICAgICAgIGlmICghc3RhdC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHN1YnBhdGhzID0gZnMucmVhZGRpclN5bmMoZGlyKSwgc3VicGF0aCwgc2l6ZSwgbWQ1LCBjb21wcmVzc2VkLCByZWxhdGl2ZTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3VicGF0aHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3VicGF0aHNbaV1bMF0gPT09ICcuJykge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3VicGF0aCA9IHBhdGguam9pbihkaXIsIHN1YnBhdGhzW2ldKTtcbiAgICAgICAgICAgICAgICBzdGF0ID0gZnMuc3RhdFN5bmMoc3VicGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWREaXIoc3VicGF0aCwgb2JqKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdC5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTaXplIGluIEJ5dGVzXG4gICAgICAgICAgICAgICAgICAgIHNpemUgPSBzdGF0WydzaXplJ107XG4gICAgICAgICAgICAgICAgICAgIG1kNSA9IGNyeXB0by5jcmVhdGVIYXNoKCdtZDUnKS51cGRhdGUoZnMucmVhZEZpbGVTeW5jKHN1YnBhdGgpKS5kaWdlc3QoJ2hleCcpO1xuICAgICAgICAgICAgICAgICAgICBjb21wcmVzc2VkID0gcGF0aC5leHRuYW1lKHN1YnBhdGgpLnRvTG93ZXJDYXNlKCkgPT09ICcuemlwJztcblxuICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZSA9IHN1YnBhdGgucmVwbGFjZSgvXFxcXC9nLCBcIi9cIikucmVwbGFjZSh0aGlzLnNyYyArIFwiL1wiLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgb2JqW3JlbGF0aXZlXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdzaXplJzogc2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdtZDUnOiBtZDVcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ialtyZWxhdGl2ZV0uY29tcHJlc3NlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpXG4gICAgICAgIH1cbiAgICB9XG5cblxufSJdfQ==