import { assetManager, AssetManager, resources } from "cc";
import { SingletonFactory } from "../utils/SingletonFactory";




export class BundleMgr {

    public static get Inst() {
        return SingletonFactory.getInstance<BundleMgr>(BundleMgr, t => {
            t.resolveResources();
        });
    }

    //资源包
    private bundle: Map<string, AssetManager.Bundle> = new Map();

    //资源地址:Bundle名字
    private address: Map<string, string> = new Map();

    private resolveResources() {
        this.resolveBundle(resources);
    }

    private resolveBundle(bundle: AssetManager.Bundle) {
        this.bundle.set(bundle.name, bundle);
        bundle.config.paths.forEach(v => {
            v.forEach(v1 => {
                if (!this.address.has(v1.path))
                    this.address.set(v1.path, bundle.name);
                else
                    console.error(`资源地址不能重复  ${bundle.name}  ${v1.path}`);
            });
        });
    }

    public loadBundle(bundleName: string, onFileProgress?: (loaded: number, total: number) => void) {
        let p = new Promise<AssetManager.Bundle>((resolve, reject) => {
            assetManager.loadBundle(bundleName,
                { onFileProgress: onFileProgress },
                (err, bundle) => {
                    if (err) {
                        console.log(err);
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
                            console.log(err);
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

    public getBundleByLocation(location: string): AssetManager.Bundle {
        let ab: AssetManager.Bundle = null;
        if (this.address.has(location)) {
            ab = this.bundle.get(this.address.get(location));
            if (!ab) console.error(`location: ${location}  资源所在Bundle未加载`);

        } else {
            console.error(`location: ${location}  资源不存在或所在Bundle未加载`);
        }
        return ab;
    }
}