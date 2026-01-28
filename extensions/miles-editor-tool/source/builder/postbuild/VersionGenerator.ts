import crypto from "crypto";
import fs from "fs-extra";
import path from "path";

class Manifest {
    packageUrl = 'https://localhost/hotupdate/remote-assets/';
    remoteManifestUrl = 'https://localhost/hotupdate/remote-assets/project.manifest';
    remoteVersionUrl = 'http://localhost/hotupdate/remote-assets/version.manifest';
    version = '1.0.0';
    assets = {};
    searchPaths = [];
}

export class VersionGenerator {

    private static data = '';

    public static gen(url: string, pactchVersion: string, data: string, dest: string) {


        let projectManifest = new Manifest();
        projectManifest.packageUrl = url + "/" + pactchVersion;
        projectManifest.remoteManifestUrl = "";
        projectManifest.remoteVersionUrl = url + '/version.manifest';
        projectManifest.version = pactchVersion;

        this.data = data;

        fs.emptyDirSync(dest);

        // Iterate assets and src folder
        this.readDir(path.join(data, 'src'), projectManifest.assets);
        this.readDir(path.join(data, 'assets'), projectManifest.assets);
        this.readDir(path.join(data, 'jsb-adapter'), projectManifest.assets);

        let destManifest = path.join(dest, 'project.manifest');
        let destVersion = path.join(dest, 'version.manifest');

        fs.writeJSONSync(destManifest, projectManifest);//保存project.manifest

        let versionManifest = new Manifest();
        versionManifest.packageUrl = url + "/" + pactchVersion;
        versionManifest.remoteManifestUrl = versionManifest.packageUrl + '/project.manifest';
        versionManifest.remoteVersionUrl = "";
        versionManifest.version = pactchVersion;

        delete versionManifest.assets;
        delete versionManifest.searchPaths;

        fs.writeJSONSync(destVersion, versionManifest);//保存version.manifest

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
                    md5 = crypto.createHash('md5').update(fs.readFileSync(subpath) as any).digest('hex');
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