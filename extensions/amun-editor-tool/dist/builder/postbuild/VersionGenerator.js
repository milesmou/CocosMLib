"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionGenerator = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Logger_1 = require("../../tools/Logger");
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
    static gen(url, version, data, dest, normalBuild) {
        let manifest = new Manifest();
        manifest.packageUrl = url;
        manifest.remoteManifestUrl = url + '/project.manifest';
        manifest.remoteVersionUrl = url + '/version.manifest';
        manifest.version = version;
        this.data = data;
        fs_extra_1.default.emptyDirSync(dest);
        // 生成热更资源时,还原src目录下资源文件名 追加Md5
        this.renameSrcFiles(path_1.default.join(data, 'src'), true);
        // Iterate assets and src folder
        this.readDir(path_1.default.join(data, 'src'), manifest.assets);
        this.readDir(path_1.default.join(data, 'assets'), manifest.assets);
        this.readDir(path_1.default.join(data, 'jsb-adapter'), manifest.assets);
        let destManifest = path_1.default.join(dest, 'project.manifest');
        let destVersion = path_1.default.join(dest, 'version.manifest');
        fs_extra_1.default.writeJSONSync(destManifest, manifest);
        delete manifest.assets;
        delete manifest.searchPaths;
        fs_extra_1.default.writeJSONSync(destVersion, manifest);
        //如果是正常构建工程 还需要移除src目录下文件的Md5
        if (normalBuild)
            this.renameSrcFiles(path_1.default.join(data, 'src'), false);
    }
    static renameSrcFiles(dir, appenOrRemovedMd5) {
        let files = Utils_1.Utils.getAllFiles(dir, null, true);
        files.forEach(file => {
            Logger_1.Logger.debug(appenOrRemovedMd5, file);
            if (appenOrRemovedMd5) { //追加Md5值
                Utils_1.Utils.appendMd5(file);
            }
            else { //移除Md5值
                Utils_1.Utils.removeMd5(file);
            }
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
                    relative = subpath.replace(/\\/g, "/").replace(this.data + "/", "");
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
VersionGenerator.data = '';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmVyc2lvbkdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS9idWlsZGVyL3Bvc3RidWlsZC9WZXJzaW9uR2VuZXJhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG9EQUE0QjtBQUM1Qix3REFBMEI7QUFDMUIsZ0RBQXdCO0FBQ3hCLCtDQUE0QztBQUM1Qyw2Q0FBMEM7QUFFMUMsTUFBTSxRQUFRO0lBQWQ7UUFDSSxlQUFVLEdBQUcscURBQXFELENBQUM7UUFDbkUsc0JBQWlCLEdBQUcscUVBQXFFLENBQUM7UUFDMUYscUJBQWdCLEdBQUcscUVBQXFFLENBQUM7UUFDekYsWUFBTyxHQUFHLE9BQU8sQ0FBQztRQUNsQixXQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ1osZ0JBQVcsR0FBRyxFQUFFLENBQUM7SUFDckIsQ0FBQztDQUFBO0FBRUQsTUFBYSxnQkFBZ0I7SUFJbEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFXLEVBQUUsT0FBZSxFQUFFLElBQVksRUFBRSxJQUFZLEVBQUUsV0FBb0I7UUFDNUYsSUFBSSxRQUFRLEdBQUcsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUU5QixRQUFRLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztRQUMxQixRQUFRLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxHQUFHLG1CQUFtQixDQUFDO1FBQ3ZELFFBQVEsQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLEdBQUcsbUJBQW1CLENBQUM7UUFDdEQsUUFBUSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDM0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFFakIsa0JBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEIsOEJBQThCO1FBQzlCLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7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RSxFQUFFO29CQUNwQixnQkFBZ0I7b0JBQ2hCLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3BCLEdBQUcsR0FBRyxnQkFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsa0JBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzlFLFVBQVUsR0FBRyxjQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLE1BQU0sQ0FBQztvQkFFNUQsUUFBUSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDcEUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHO3dCQUNaLE1BQU0sRUFBRSxJQUFJO3dCQUNaLEtBQUssRUFBRSxHQUFHO3FCQUNiLENBQUM7b0JBQ0YsSUFBSSxVQUFVLEVBQUU7d0JBQ1osR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7cUJBQ25DO2lCQUNKO2FBQ0o7U0FDSjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNyQjtJQUNMLENBQUM7O0FBbEZMLDRDQXFGQztBQW5Ga0IscUJBQUksR0FBRyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY3J5cHRvIGZyb20gXCJjcnlwdG9cIjtcbmltcG9ydCBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBMb2dnZXIgfSBmcm9tIFwiLi4vLi4vdG9vbHMvTG9nZ2VyXCI7XG5pbXBvcnQgeyBVdGlscyB9IGZyb20gXCIuLi8uLi90b29scy9VdGlsc1wiO1xuXG5jbGFzcyBNYW5pZmVzdCB7XG4gICAgcGFja2FnZVVybCA9ICdodHRwOi8vbG9jYWxob3N0L3R1dG9yaWFsLWhvdC11cGRhdGUvcmVtb3RlLWFzc2V0cy8nO1xuICAgIHJlbW90ZU1hbmlmZXN0VXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3QvdHV0b3JpYWwtaG90LXVwZGF0ZS9yZW1vdGUtYXNzZXRzL3Byb2plY3QubWFuaWZlc3QnO1xuICAgIHJlbW90ZVZlcnNpb25VcmwgPSAnaHR0cDovL2xvY2FsaG9zdC90dXRvcmlhbC1ob3QtdXBkYXRlL3JlbW90ZS1hc3NldHMvdmVyc2lvbi5tYW5pZmVzdCc7XG4gICAgdmVyc2lvbiA9ICcxLjAuMCc7XG4gICAgYXNzZXRzID0ge307XG4gICAgc2VhcmNoUGF0aHMgPSBbXTtcbn1cblxuZXhwb3J0IGNsYXNzIFZlcnNpb25HZW5lcmF0b3Ige1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZGF0YSA9ICcnO1xuXG4gICAgcHVibGljIHN0YXRpYyBnZW4odXJsOiBzdHJpbmcsIHZlcnNpb246IHN0cmluZywgZGF0YTogc3RyaW5nLCBkZXN0OiBzdHJpbmcsIG5vcm1hbEJ1aWxkOiBib29sZWFuKSB7XG4gICAgICAgIGxldCBtYW5pZmVzdCA9IG5ldyBNYW5pZmVzdCgpO1xuXG4gICAgICAgIG1hbmlmZXN0LnBhY2thZ2VVcmwgPSB1cmw7XG4gICAgICAgIG1hbmlmZXN0LnJlbW90ZU1hbmlmZXN0VXJsID0gdXJsICsgJy9wcm9qZWN0Lm1hbmlmZXN0JztcbiAgICAgICAgbWFuaWZlc3QucmVtb3RlVmVyc2lvblVybCA9IHVybCArICcvdmVyc2lvbi5tYW5pZmVzdCc7XG4gICAgICAgIG1hbmlmZXN0LnZlcnNpb24gPSB2ZXJzaW9uO1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuXG4gICAgICAgIGZzLmVtcHR5RGlyU3luYyhkZXN0KTtcbiAgICAgICAgLy8g55Sf5oiQ54Ot5pu06LWE5rqQ5pe2LOi/mOWOn3NyY+ebruW9leS4i+i1hOa6kOaWh+S7tuWQjSDov73liqBNZDVcbiAgICAgICAgdGhpcy5yZW5hbWVTcmNGaWxlcyhwYXRoLmpvaW4oZGF0YSwgJ3NyYycpLCB0cnVlKTtcblxuICAgICAgICAvLyBJdGVyYXRlIGFzc2V0cyBhbmQgc3JjIGZvbGRlclxuICAgICAgICB0aGlzLnJlYWREaXIocGF0aC5qb2luKGRhdGEsICdzcmMnKSwgbWFuaWZlc3QuYXNzZXRzKTtcbiAgICAgICAgdGhpcy5yZWFkRGlyKHBhdGguam9pbihkYXRhLCAnYXNzZXRzJyksIG1hbmlmZXN0LmFzc2V0cyk7XG4gICAgICAgIHRoaXMucmVhZERpcihwYXRoLmpvaW4oZGF0YSwgJ2pzYi1hZGFwdGVyJyksIG1hbmlmZXN0LmFzc2V0cyk7XG5cbiAgICAgICAgbGV0IGRlc3RNYW5pZmVzdCA9IHBhdGguam9pbihkZXN0LCAncHJvamVjdC5tYW5pZmVzdCcpO1xuICAgICAgICBsZXQgZGVzdFZlcnNpb24gPSBwYXRoLmpvaW4oZGVzdCwgJ3ZlcnNpb24ubWFuaWZlc3QnKTtcblxuICAgICAgICBmcy53cml0ZUpTT05TeW5jKGRlc3RNYW5pZmVzdCwgbWFuaWZlc3QpO1xuXG4gICAgICAgIGRlbGV0ZSBtYW5pZmVzdC5hc3NldHM7XG4gICAgICAgIGRlbGV0ZSBtYW5pZmVzdC5zZWFyY2hQYXRocztcbiAgICAgICAgZnMud3JpdGVKU09OU3luYyhkZXN0VmVyc2lvbiwgbWFuaWZlc3QpO1xuXG4gICAgICAgIC8v5aaC5p6c5piv5q2j5bi45p6E5bu65bel56iLIOi/mOmcgOimgeenu+mZpHNyY+ebruW9leS4i+aWh+S7tueahE1kNVxuICAgICAgICBpZiAobm9ybWFsQnVpbGQpIHRoaXMucmVuYW1lU3JjRmlsZXMocGF0aC5qb2luKGRhdGEsICdzcmMnKSwgZmFsc2UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIHJlbmFtZVNyY0ZpbGVzKGRpcjogc3RyaW5nLCBhcHBlbk9yUmVtb3ZlZE1kNTogYm9vbGVhbikge1xuICAgICAgICBsZXQgZmlsZXMgPSBVdGlscy5nZXRBbGxGaWxlcyhkaXIsIG51bGwsIHRydWUpO1xuICAgICAgICBmaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgICAgICAgTG9nZ2VyLmRlYnVnKGFwcGVuT3JSZW1vdmVkTWQ1LCBmaWxlKTtcbiAgICAgICAgICAgIGlmIChhcHBlbk9yUmVtb3ZlZE1kNSkgey8v6L+95YqgTWQ15YC8XG4gICAgICAgICAgICAgICAgVXRpbHMuYXBwZW5kTWQ1KGZpbGUpO1xuICAgICAgICAgICAgfSBlbHNlIHsvL+enu+mZpE1kNeWAvFxuICAgICAgICAgICAgICAgIFV0aWxzLnJlbW92ZU1kNShmaWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZERpcihkaXIsIG9iaikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHN0YXQgPSBmcy5zdGF0U3luYyhkaXIpO1xuICAgICAgICAgICAgaWYgKCFzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgc3VicGF0aHMgPSBmcy5yZWFkZGlyU3luYyhkaXIpLCBzdWJwYXRoLCBzaXplLCBtZDUsIGNvbXByZXNzZWQsIHJlbGF0aXZlO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdWJwYXRocy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmIChzdWJwYXRoc1tpXVswXSA9PT0gJy4nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdWJwYXRoID0gcGF0aC5qb2luKGRpciwgc3VicGF0aHNbaV0pO1xuICAgICAgICAgICAgICAgIHN0YXQgPSBmcy5zdGF0U3luYyhzdWJwYXRoKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZERpcihzdWJwYXRoLCBvYmopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChzdGF0LmlzRmlsZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNpemUgaW4gQnl0ZXNcbiAgICAgICAgICAgICAgICAgICAgc2l6ZSA9IHN0YXRbJ3NpemUnXTtcbiAgICAgICAgICAgICAgICAgICAgbWQ1ID0gY3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpLnVwZGF0ZShmcy5yZWFkRmlsZVN5bmMoc3VicGF0aCkpLmRpZ2VzdCgnaGV4Jyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbXByZXNzZWQgPSBwYXRoLmV4dG5hbWUoc3VicGF0aCkudG9Mb3dlckNhc2UoKSA9PT0gJy56aXAnO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlID0gc3VicGF0aC5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKS5yZXBsYWNlKHRoaXMuZGF0YSArIFwiL1wiLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgb2JqW3JlbGF0aXZlXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdzaXplJzogc2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdtZDUnOiBtZDVcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ialtyZWxhdGl2ZV0uY29tcHJlc3NlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpXG4gICAgICAgIH1cbiAgICB9XG5cblxufSJdfQ==