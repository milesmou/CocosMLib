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
        this.packageUrl = 'https://localhost/hotupdate/remote-assets/';
        this.remoteManifestUrl = 'https://localhost/hotupdate/remote-assets/project.manifest';
        this.remoteVersionUrl = 'http://localhost/hotupdate/remote-assets/version.manifest';
        this.version = '1.0.0';
        this.assets = {};
        this.searchPaths = [];
    }
}
class VersionGenerator {
    static gen(url, pactchVersion, data, dest) {
        let projectManifest = new Manifest();
        projectManifest.packageUrl = url + "/" + pactchVersion;
        projectManifest.remoteManifestUrl = "";
        projectManifest.remoteVersionUrl = url + '/version.manifest';
        projectManifest.version = pactchVersion;
        this.data = data;
        fs_extra_1.default.emptyDirSync(dest);
        // Iterate assets and src folder
        this.readDir(path_1.default.join(data, 'src'), projectManifest.assets);
        this.readDir(path_1.default.join(data, 'assets'), projectManifest.assets);
        this.readDir(path_1.default.join(data, 'jsb-adapter'), projectManifest.assets);
        let destManifest = path_1.default.join(dest, 'project.manifest');
        let destVersion = path_1.default.join(dest, 'version.manifest');
        fs_extra_1.default.writeJSONSync(destManifest, projectManifest); //保存project.manifest
        let versionManifest = new Manifest();
        versionManifest.packageUrl = url + "/" + pactchVersion;
        versionManifest.remoteManifestUrl = versionManifest.packageUrl + '/project.manifest';
        versionManifest.remoteVersionUrl = "";
        versionManifest.version = pactchVersion;
        delete versionManifest.assets;
        delete versionManifest.searchPaths;
        fs_extra_1.default.writeJSONSync(destVersion, versionManifest); //保存version.manifest
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmVyc2lvbkdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS9idWlsZGVyL3Bvc3RidWlsZC9WZXJzaW9uR2VuZXJhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG9EQUE0QjtBQUM1Qix3REFBMEI7QUFDMUIsZ0RBQXdCO0FBRXhCLE1BQU0sUUFBUTtJQUFkO1FBQ0ksZUFBVSxHQUFHLDRDQUE0QyxDQUFDO1FBQzFELHNCQUFpQixHQUFHLDREQUE0RCxDQUFDO1FBQ2pGLHFCQUFnQixHQUFHLDJEQUEyRCxDQUFDO1FBQy9FLFlBQU8sR0FBRyxPQUFPLENBQUM7UUFDbEIsV0FBTSxHQUFHLEVBQUUsQ0FBQztRQUNaLGdCQUFXLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7Q0FBQTtBQUVELE1BQWEsZ0JBQWdCO0lBSWxCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBVyxFQUFFLGFBQXFCLEVBQUUsSUFBWSxFQUFFLElBQVk7UUFHNUUsSUFBSSxlQUFlLEdBQUcsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNyQyxlQUFlLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsYUFBYSxDQUFDO1FBQ3ZELGVBQWUsQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUM7UUFDdkMsZUFBZSxDQUFDLGdCQUFnQixHQUFHLEdBQUcsR0FBRyxtQkFBbUIsQ0FBQztRQUM3RCxlQUFlLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQztRQUV4QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQixrQkFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV0QixnQ0FBZ0M7UUFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLE9B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QUFFLENBQUMsQ0FBQztvQkFDcEUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHO3dCQUNaLE1BQU0sRUFBRSxJQUFJO3dCQUNaLEtBQUssRUFBRSxHQUFHO3FCQUNiLENBQUM7b0JBQ0YsSUFBSSxVQUFVLEVBQUU7d0JBQ1osR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7cUJBQ25DO2lCQUNKO2FBQ0o7U0FDSjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNyQjtJQUNMLENBQUM7O0FBM0VMLDRDQThFQztBQTVFa0IscUJBQUksR0FBRyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY3J5cHRvIGZyb20gXCJjcnlwdG9cIjtcbmltcG9ydCBmcyBmcm9tIFwiZnMtZXh0cmFcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmNsYXNzIE1hbmlmZXN0IHtcbiAgICBwYWNrYWdlVXJsID0gJ2h0dHBzOi8vbG9jYWxob3N0L2hvdHVwZGF0ZS9yZW1vdGUtYXNzZXRzLyc7XG4gICAgcmVtb3RlTWFuaWZlc3RVcmwgPSAnaHR0cHM6Ly9sb2NhbGhvc3QvaG90dXBkYXRlL3JlbW90ZS1hc3NldHMvcHJvamVjdC5tYW5pZmVzdCc7XG4gICAgcmVtb3RlVmVyc2lvblVybCA9ICdodHRwOi8vbG9jYWxob3N0L2hvdHVwZGF0ZS9yZW1vdGUtYXNzZXRzL3ZlcnNpb24ubWFuaWZlc3QnO1xuICAgIHZlcnNpb24gPSAnMS4wLjAnO1xuICAgIGFzc2V0cyA9IHt9O1xuICAgIHNlYXJjaFBhdGhzID0gW107XG59XG5cbmV4cG9ydCBjbGFzcyBWZXJzaW9uR2VuZXJhdG9yIHtcblxuICAgIHByaXZhdGUgc3RhdGljIGRhdGEgPSAnJztcblxuICAgIHB1YmxpYyBzdGF0aWMgZ2VuKHVybDogc3RyaW5nLCBwYWN0Y2hWZXJzaW9uOiBzdHJpbmcsIGRhdGE6IHN0cmluZywgZGVzdDogc3RyaW5nKSB7XG5cblxuICAgICAgICBsZXQgcHJvamVjdE1hbmlmZXN0ID0gbmV3IE1hbmlmZXN0KCk7XG4gICAgICAgIHByb2plY3RNYW5pZmVzdC5wYWNrYWdlVXJsID0gdXJsICsgXCIvXCIgKyBwYWN0Y2hWZXJzaW9uO1xuICAgICAgICBwcm9qZWN0TWFuaWZlc3QucmVtb3RlTWFuaWZlc3RVcmwgPSBcIlwiO1xuICAgICAgICBwcm9qZWN0TWFuaWZlc3QucmVtb3RlVmVyc2lvblVybCA9IHVybCArICcvdmVyc2lvbi5tYW5pZmVzdCc7XG4gICAgICAgIHByb2plY3RNYW5pZmVzdC52ZXJzaW9uID0gcGFjdGNoVmVyc2lvbjtcblxuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuXG4gICAgICAgIGZzLmVtcHR5RGlyU3luYyhkZXN0KTtcblxuICAgICAgICAvLyBJdGVyYXRlIGFzc2V0cyBhbmQgc3JjIGZvbGRlclxuICAgICAgICB0aGlzLnJlYWREaXIocGF0aC5qb2luKGRhdGEsICdzcmMnKSwgcHJvamVjdE1hbmlmZXN0LmFzc2V0cyk7XG4gICAgICAgIHRoaXMucmVhZERpcihwYXRoLmpvaW4oZGF0YSwgJ2Fzc2V0cycpLCBwcm9qZWN0TWFuaWZlc3QuYXNzZXRzKTtcbiAgICAgICAgdGhpcy5yZWFkRGlyKHBhdGguam9pbihkYXRhLCAnanNiLWFkYXB0ZXInKSwgcHJvamVjdE1hbmlmZXN0LmFzc2V0cyk7XG5cbiAgICAgICAgbGV0IGRlc3RNYW5pZmVzdCA9IHBhdGguam9pbihkZXN0LCAncHJvamVjdC5tYW5pZmVzdCcpO1xuICAgICAgICBsZXQgZGVzdFZlcnNpb24gPSBwYXRoLmpvaW4oZGVzdCwgJ3ZlcnNpb24ubWFuaWZlc3QnKTtcblxuICAgICAgICBmcy53cml0ZUpTT05TeW5jKGRlc3RNYW5pZmVzdCwgcHJvamVjdE1hbmlmZXN0KTsvL+S/neWtmHByb2plY3QubWFuaWZlc3RcblxuICAgICAgICBsZXQgdmVyc2lvbk1hbmlmZXN0ID0gbmV3IE1hbmlmZXN0KCk7XG4gICAgICAgIHZlcnNpb25NYW5pZmVzdC5wYWNrYWdlVXJsID0gdXJsICsgXCIvXCIgKyBwYWN0Y2hWZXJzaW9uO1xuICAgICAgICB2ZXJzaW9uTWFuaWZlc3QucmVtb3RlTWFuaWZlc3RVcmwgPSB2ZXJzaW9uTWFuaWZlc3QucGFja2FnZVVybCArICcvcHJvamVjdC5tYW5pZmVzdCc7XG4gICAgICAgIHZlcnNpb25NYW5pZmVzdC5yZW1vdGVWZXJzaW9uVXJsID0gXCJcIjtcbiAgICAgICAgdmVyc2lvbk1hbmlmZXN0LnZlcnNpb24gPSBwYWN0Y2hWZXJzaW9uO1xuXG4gICAgICAgIGRlbGV0ZSB2ZXJzaW9uTWFuaWZlc3QuYXNzZXRzO1xuICAgICAgICBkZWxldGUgdmVyc2lvbk1hbmlmZXN0LnNlYXJjaFBhdGhzO1xuXG4gICAgICAgIGZzLndyaXRlSlNPTlN5bmMoZGVzdFZlcnNpb24sIHZlcnNpb25NYW5pZmVzdCk7Ly/kv53lrZh2ZXJzaW9uLm1hbmlmZXN0XG5cbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyByZWFkRGlyKGRpciwgb2JqKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgc3RhdCA9IGZzLnN0YXRTeW5jKGRpcik7XG4gICAgICAgICAgICBpZiAoIXN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBzdWJwYXRocyA9IGZzLnJlYWRkaXJTeW5jKGRpciksIHN1YnBhdGgsIHNpemUsIG1kNSwgY29tcHJlc3NlZCwgcmVsYXRpdmU7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1YnBhdGhzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN1YnBhdGhzW2ldWzBdID09PSAnLicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN1YnBhdGggPSBwYXRoLmpvaW4oZGlyLCBzdWJwYXRoc1tpXSk7XG4gICAgICAgICAgICAgICAgc3RhdCA9IGZzLnN0YXRTeW5jKHN1YnBhdGgpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkRGlyKHN1YnBhdGgsIG9iaik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHN0YXQuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2l6ZSBpbiBCeXRlc1xuICAgICAgICAgICAgICAgICAgICBzaXplID0gc3RhdFsnc2l6ZSddO1xuICAgICAgICAgICAgICAgICAgICBtZDUgPSBjcnlwdG8uY3JlYXRlSGFzaCgnbWQ1JykudXBkYXRlKGZzLnJlYWRGaWxlU3luYyhzdWJwYXRoKSBhcyBhbnkpLmRpZ2VzdCgnaGV4Jyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbXByZXNzZWQgPSBwYXRoLmV4dG5hbWUoc3VicGF0aCkudG9Mb3dlckNhc2UoKSA9PT0gJy56aXAnO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlID0gc3VicGF0aC5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKS5yZXBsYWNlKHRoaXMuZGF0YSArIFwiL1wiLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgb2JqW3JlbGF0aXZlXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdzaXplJzogc2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdtZDUnOiBtZDVcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ialtyZWxhdGl2ZV0uY29tcHJlc3NlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpXG4gICAgICAgIH1cbiAgICB9XG5cblxufSJdfQ==