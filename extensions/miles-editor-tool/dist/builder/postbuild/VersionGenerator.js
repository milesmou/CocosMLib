"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionGenerator = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
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
    static gen(url, version, data, dest) {
        let manifest = new Manifest();
        manifest.packageUrl = url + "/" + version;
        manifest.remoteManifestUrl = manifest.packageUrl + '/project.manifest';
        manifest.remoteVersionUrl = url + '/version.manifest';
        manifest.version = version;
        this.data = data;
        fs_extra_1.default.emptyDirSync(dest);
        // Iterate assets and src folder
        this.readDir(path_1.default.join(data, 'src'), manifest.assets);
        this.readDir(path_1.default.join(data, 'assets'), manifest.assets);
        this.readDir(path_1.default.join(data, 'jsb-adapter'), manifest.assets);
        let destManifest = path_1.default.join(dest, 'project.manifest');
        let destVersion = path_1.default.join(dest, 'version.manifest');
        fs_extra_1.default.writeJSONSync(destManifest, manifest); //保存project.manifest
        delete manifest.assets;
        delete manifest.searchPaths;
        fs_extra_1.default.writeJSONSync(destVersion, manifest); //version.manifest
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmVyc2lvbkdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS9idWlsZGVyL3Bvc3RidWlsZC9WZXJzaW9uR2VuZXJhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG9EQUE0QjtBQUM1Qix3REFBMEI7QUFDMUIsZ0RBQXdCO0FBRXhCLE1BQU0sUUFBUTtJQUFkO1FBQ0ksZUFBVSxHQUFHLHFEQUFxRCxDQUFDO1FBQ25FLHNCQUFpQixHQUFHLHFFQUFxRSxDQUFDO1FBQzFGLHFCQUFnQixHQUFHLHFFQUFxRSxDQUFDO1FBQ3pGLFlBQU8sR0FBRyxPQUFPLENBQUM7UUFDbEIsV0FBTSxHQUFHLEVBQUUsQ0FBQztRQUNaLGdCQUFXLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7Q0FBQTtBQUVELE1BQWEsZ0JBQWdCO0lBSWxCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBVyxFQUFFLE9BQWUsRUFBRSxJQUFZLEVBQUUsSUFBWTtRQUN0RSxJQUFJLFFBQVEsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBRTlCLFFBQVEsQ0FBQyxVQUFVLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUM7UUFDMUMsUUFBUSxDQUFDLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxVQUFVLEdBQUcsbUJBQW1CLENBQUM7UUFDdkUsUUFBUSxDQUFDLGdCQUFnQixHQUFHLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQztRQUN0RCxRQUFRLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQixrQkFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV0QixnQ0FBZ0M7UUFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENB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QUFFO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNyQjtJQUNMLENBQUM7O0FBbEVMLDRDQXFFQztBQW5Fa0IscUJBQUksR0FBRyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY3J5cHRvIGZyb20gXCJjcnlwdG9cIjtcbmltcG9ydCBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmNsYXNzIE1hbmlmZXN0IHtcbiAgICBwYWNrYWdlVXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3QvdHV0b3JpYWwtaG90LXVwZGF0ZS9yZW1vdGUtYXNzZXRzLyc7XG4gICAgcmVtb3RlTWFuaWZlc3RVcmwgPSAnaHR0cDovL2xvY2FsaG9zdC90dXRvcmlhbC1ob3QtdXBkYXRlL3JlbW90ZS1hc3NldHMvcHJvamVjdC5tYW5pZmVzdCc7XG4gICAgcmVtb3RlVmVyc2lvblVybCA9ICdodHRwOi8vbG9jYWxob3N0L3R1dG9yaWFsLWhvdC11cGRhdGUvcmVtb3RlLWFzc2V0cy92ZXJzaW9uLm1hbmlmZXN0JztcbiAgICB2ZXJzaW9uID0gJzEuMC4wJztcbiAgICBhc3NldHMgPSB7fTtcbiAgICBzZWFyY2hQYXRocyA9IFtdO1xufVxuXG5leHBvcnQgY2xhc3MgVmVyc2lvbkdlbmVyYXRvciB7XG5cbiAgICBwcml2YXRlIHN0YXRpYyBkYXRhID0gJyc7XG5cbiAgICBwdWJsaWMgc3RhdGljIGdlbih1cmw6IHN0cmluZywgdmVyc2lvbjogc3RyaW5nLCBkYXRhOiBzdHJpbmcsIGRlc3Q6IHN0cmluZykge1xuICAgICAgICBsZXQgbWFuaWZlc3QgPSBuZXcgTWFuaWZlc3QoKTtcblxuICAgICAgICBtYW5pZmVzdC5wYWNrYWdlVXJsID0gdXJsICsgXCIvXCIgKyB2ZXJzaW9uO1xuICAgICAgICBtYW5pZmVzdC5yZW1vdGVNYW5pZmVzdFVybCA9IG1hbmlmZXN0LnBhY2thZ2VVcmwgKyAnL3Byb2plY3QubWFuaWZlc3QnO1xuICAgICAgICBtYW5pZmVzdC5yZW1vdGVWZXJzaW9uVXJsID0gdXJsICsgJy92ZXJzaW9uLm1hbmlmZXN0JztcbiAgICAgICAgbWFuaWZlc3QudmVyc2lvbiA9IHZlcnNpb247XG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG5cbiAgICAgICAgZnMuZW1wdHlEaXJTeW5jKGRlc3QpO1xuXG4gICAgICAgIC8vIEl0ZXJhdGUgYXNzZXRzIGFuZCBzcmMgZm9sZGVyXG4gICAgICAgIHRoaXMucmVhZERpcihwYXRoLmpvaW4oZGF0YSwgJ3NyYycpLCBtYW5pZmVzdC5hc3NldHMpO1xuICAgICAgICB0aGlzLnJlYWREaXIocGF0aC5qb2luKGRhdGEsICdhc3NldHMnKSwgbWFuaWZlc3QuYXNzZXRzKTtcbiAgICAgICAgdGhpcy5yZWFkRGlyKHBhdGguam9pbihkYXRhLCAnanNiLWFkYXB0ZXInKSwgbWFuaWZlc3QuYXNzZXRzKTtcblxuICAgICAgICBsZXQgZGVzdE1hbmlmZXN0ID0gcGF0aC5qb2luKGRlc3QsICdwcm9qZWN0Lm1hbmlmZXN0Jyk7XG4gICAgICAgIGxldCBkZXN0VmVyc2lvbiA9IHBhdGguam9pbihkZXN0LCAndmVyc2lvbi5tYW5pZmVzdCcpO1xuXG4gICAgICAgIGZzLndyaXRlSlNPTlN5bmMoZGVzdE1hbmlmZXN0LCBtYW5pZmVzdCk7Ly/kv53lrZhwcm9qZWN0Lm1hbmlmZXN0XG5cbiAgICAgICAgZGVsZXRlIG1hbmlmZXN0LmFzc2V0cztcbiAgICAgICAgZGVsZXRlIG1hbmlmZXN0LnNlYXJjaFBhdGhzO1xuICAgICAgICBmcy53cml0ZUpTT05TeW5jKGRlc3RWZXJzaW9uLCBtYW5pZmVzdCk7Ly92ZXJzaW9uLm1hbmlmZXN0XG5cbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyByZWFkRGlyKGRpciwgb2JqKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgc3RhdCA9IGZzLnN0YXRTeW5jKGRpcik7XG4gICAgICAgICAgICBpZiAoIXN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBzdWJwYXRocyA9IGZzLnJlYWRkaXJTeW5jKGRpciksIHN1YnBhdGgsIHNpemUsIG1kNSwgY29tcHJlc3NlZCwgcmVsYXRpdmU7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1YnBhdGhzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN1YnBhdGhzW2ldWzBdID09PSAnLicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN1YnBhdGggPSBwYXRoLmpvaW4oZGlyLCBzdWJwYXRoc1tpXSk7XG4gICAgICAgICAgICAgICAgc3RhdCA9IGZzLnN0YXRTeW5jKHN1YnBhdGgpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkRGlyKHN1YnBhdGgsIG9iaik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2l6ZSBpbiBCeXRlc1xuICAgICAgICAgICAgICAgICAgICBzaXplID0gc3RhdFsnc2l6ZSddO1xuICAgICAgICAgICAgICAgICAgICBtZDUgPSBjcnlwdG8uY3JlYXRlSGFzaCgnbWQ1JykudXBkYXRlKGZzLnJlYWRGaWxlU3luYyhzdWJwYXRoKSkuZGlnZXN0KCdoZXgnKTtcbiAgICAgICAgICAgICAgICAgICAgY29tcHJlc3NlZCA9IHBhdGguZXh0bmFtZShzdWJwYXRoKS50b0xvd2VyQ2FzZSgpID09PSAnLnppcCc7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmUgPSBzdWJwYXRoLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpLnJlcGxhY2UodGhpcy5kYXRhICsgXCIvXCIsIFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICBvYmpbcmVsYXRpdmVdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemUnOiBzaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ21kNSc6IG1kNVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcHJlc3NlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqW3JlbGF0aXZlXS5jb21wcmVzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycilcbiAgICAgICAgfVxuICAgIH1cblxuXG59Il19