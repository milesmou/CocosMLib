import { assetManager, AssetManager } from "cc";

export enum BundleKey {
    bundle1,
    bundle2,
    count
}

export class BundleMgr {

    public bundle: Map<BundleKey, AssetManager.Bundle> = new Map();

    public loadBundle(bundleKey: BundleKey, onFileProgress?: (loaded: number, total: number) => void) {
        let p = new Promise<AssetManager.Bundle>((resolve, reject) => {
            assetManager.loadBundle(BundleKey[bundleKey],
                { onFileProgress: onFileProgress },
                (err, bundle) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        this.bundle.set(bundleKey, bundle);
                        resolve(bundle);
                    }
                }
            )
        })
        return p;
    }

    public loadAllBundle(onFileProgress?: (loaded: number, total: number) => void) {
        let p = new Promise<AssetManager.Bundle[]>((resolve, reject) => {
            let progress: number[] = [];
            let bundleArr: AssetManager.Bundle[] = [];
            for (let i = 0; i < BundleKey.count; i++) {
                assetManager.loadBundle(BundleKey[i],
                    {
                        onFileProgress: (loaded: number, total: number) => {
                            if (onFileProgress) {
                                progress[i] = loaded / total;
                                let totalProgress = 0;
                                for (let i = 0; i < BundleKey.count; i++) {
                                    totalProgress += (progress[i] || 0);
                                }
                                onFileProgress(totalProgress / BundleKey.count, 1);
                            }
                        }
                    },
                    (err, bundle) => {
                        if (err) {
                            console.log(err);
                            reject(err)
                        } else {
                            bundleArr.push(bundle);
                            this.bundle.set(i, bundle);
                            if (bundleArr.length == BundleKey.count) {
                                resolve(bundleArr);
                            }
                        }
                    }
                )
            }
        })
        return p;
    }
}