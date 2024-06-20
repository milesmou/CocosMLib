"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionGenerator = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
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
