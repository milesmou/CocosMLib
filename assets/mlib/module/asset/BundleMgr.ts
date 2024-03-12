import { AssetManager, assetManager, js, resources } from "cc";
import { SingletonFactory } from "../../utils/SingletonFactory";
import { MLogger } from "../logger/MLogger";

export class BundleMgr {

    public static get Inst() { return SingletonFactory.getInstance<BundleMgr>(BundleMgr); }

    //bundle名字:Bundle
    private bundles: Map<string, AssetManager.Bundle> = new Map();

    //资源地址:Bundle名字
    private address: Map<string, string> = new Map();
    //资源目录:资源地址数组
    private dirAddress: Map<string, string[]> = new Map();

    private onInst() {
        this.resolveResources();
    }

    private resolveResources() {
        if (resources) this.resolveBundle(resources);
    }

    private resolveBundle(bundle: AssetManager.Bundle) {
        this.bundles.set(bundle.name, bundle);
        bundle["_config"].paths.forEach(v => {
            v.forEach(v1 => {
                let path: string = v1.path;

                // MLogger.debug(bundle.name, path);
                let dir = path.substring(0, path.lastIndexOf("/"));
                if (!this.dirAddress.get(dir)) this.dirAddress.set(dir, []);
                let typeName = js.getClassName(v1.ctor);
                if (v.length > 1 && typeName != "cc.ImageAsset") {//对同名的多个资源添加类型后缀
                    path = path + "/" + js.getClassName(v1.ctor);
                }
                this.dirAddress.get(dir).push(path);

                if (!this.address.has(path)) {
                    this.address.set(path, bundle.name);
                }
                else {
                    MLogger.error(`资源地址不能重复  ${bundle.name}  ${v1.path}`);
                }
            });
        });

    }

    public loadBundle(bundleName: string, onFileProgress?: (loaded: number, total: number) => void) {
        let p = new Promise<AssetManager.Bundle>((resolve, reject) => {
            assetManager.loadBundle(bundleName,
                { onFileProgress: onFileProgress },
                (err, bundle) => {
                    if (err) {
                        MLogger.error(err);
                        reject(err);
                    } else {
                        this.resolveBundle(bundle);
                        resolve(bundle);
                    }
                }
            )
        })
        return p;
    }

    public loadAllBundle(bundleNames: string[], onFileProgress?: (loaded: number, total: number) => void) {
        let p = new Promise<AssetManager.Bundle[]>((resolve, reject) => {
            let progress: number[] = [];
            let bundleArr: AssetManager.Bundle[] = [];
            for (let i = 0; i < bundleNames.length; i++) {
                let bundleName = bundleNames[i];
                assetManager.loadBundle(bundleName,
                    {
                        onFileProgress: (loaded: number, total: number) => {
                            if (onFileProgress) {
                                progress[i] = loaded / total;
                                let totalProgress = 0;
                                for (let i = 0; i < bundleNames.length; i++) {
                                    totalProgress += (progress[i] || 0);
                                }
                                onFileProgress(totalProgress / bundleNames.length, 1);
                            }
                        }
                    },
                    (err, bundle) => {
                        if (err) {
                            MLogger.error(err);
                            reject(err)
                        } else {
                            bundleArr.push(bundle);
                            this.resolveBundle(bundle);
                            if (bundleArr.length == bundleNames.length) {
                                resolve(bundleArr);
                            }
                        }
                    }
                )
            }
        })
        return p;
    }

    public isAssetExists(location: string) {
        return this.address.has(location);
    }

    public getBundleByLocation(location: string): AssetManager.Bundle {
        let ab: AssetManager.Bundle = null;
        if (this.address.has(location)) {
            ab = this.bundles.get(this.address.get(location));
            if (!ab) console.error(`location: ${location}  资源所在Bundle未加载`);

        } else {
            console.error(`location: ${location}  资源不存在或所在Bundle未加载`);
        }
        return ab;
    }

    public getDirectoryAddress(location: string): string[] {
        return this.dirAddress.get(location);
    }
}
