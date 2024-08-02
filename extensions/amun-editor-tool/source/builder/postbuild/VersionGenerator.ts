import crypto from "crypto";
import fs from "fs-extra";
import path from "path";
import { Logger } from "../../tools/Logger";
import { Utils } from "../../tools/Utils";

class Manifest {
    packageUrl = 'http://localhost/tutorial-hot-update/remote-assets/';
    remoteManifestUrl = 'http://localhost/tutorial-hot-update/remote-assets/project.manifest';
    remoteVersionUrl = 'http://localhost/tutorial-hot-update/remote-assets/version.manifest';
    version = '1.0.0';
    assets = {};
    searchPaths = [];
}

export class VersionGenerator {

    private static data = '';

    public static gen(url: string, version: string, data: string, dest: string, normalBuild: boolean) {
        let manifest = new Manifest();

        manifest.packageUrl = url;
        manifest.remoteManifestUrl = url + '/project.manifest';
        manifest.remoteVersionUrl = url + '/version.manifest';
        manifest.version = version;
        this.data = data;

        fs.emptyDirSync(dest);
        // 生成热更资源时,还原src目录下资源文件名 追加Md5
        this.renameSrcFiles(path.join(data, 'src'), true);

        // Iterate assets and src folder
        this.readDir(path.join(data, 'src'), manifest.assets);
        this.readDir(path.join(data, 'assets'), manifest.assets);
        this.readDir(path.join(data, 'jsb-adapter'), manifest.assets);

        let destManifest = path.join(dest, 'project.manifest');
        let destVersion = path.join(dest, 'version.manifest');

        fs.writeJSONSync(destManifest, manifest);

        delete manifest.assets;
        delete manifest.searchPaths;
        fs.writeJSONSync(destVersion, manifest);

        //如果是正常构建工程 还需要移除src目录下文件的Md5
        if (normalBuild) this.renameSrcFiles(path.join(data, 'src'), false);
    }

    private static renameSrcFiles(dir: string, appenOrRemovedMd5: boolean) {
        let files = Utils.getAllFiles(dir, null, true);
        files.forEach(file => {
            Logger.debug(appenOrRemovedMd5, file);
            if (appenOrRemovedMd5) {//追加Md5值
                Utils.appendMd5(file);
            } else {//移除Md5值
                Utils.removeMd5(file);
            }
        });
    }

    private static readDir(dir, obj) {
        try {
            let stat = fs.statSync(dir);
            if (!stat.isDirectory()) {
                return;
            }
            let subpaths = fs.readdirSync(dir), subpath, size, md5, compressed, relative;
            for (let i = 0; i < subpaths.length; ++i) {
                if (subpaths[i][0] === '.') {
                    continue;
                }
                subpath = path.join(dir, subpaths[i]);
                stat = fs.statSync(subpath);
                if (stat.isDirectory()) {
                    this.readDir(subpath, obj);
                }
                else if (stat.isFile()) {
                    // Size in Bytes
                    size = stat['size'];
                    md5 = crypto.createHash('md5').update(fs.readFileSync(subpath)).digest('hex');
                    compressed = path.extname(subpath).toLowerCase() === '.zip';

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
        } catch (err) {
            console.error(err)
        }
    }


}