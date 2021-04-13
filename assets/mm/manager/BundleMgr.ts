export enum BundleKey {
    bundle1,
    bundle2,
    count
}

export class BundleMgr {
    private constructor() { }
    private static inst: BundleMgr = null;
    public static get Inst() { return this.inst || (this.inst = new BundleMgr()) }

    public bundle: Map<BundleKey, cc.AssetManager.Bundle> = new Map();

    public loadBundle(bundleKey: BundleKey, onFileProgress?: (loaded: number, total: number) => void) {
        let p = new Promise<cc.AssetManager.Bundle>((resolve, reject) => {
            cc.assetManager.loadBundle(BundleKey[bundleKey],
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
        let p = new Promise<cc.AssetManager.Bundle[]>((resolve, reject) => {
            let progress = [];
            let bundleArr = [];
            for (let i = 0; i < BundleKey.count; i++) {
                cc.assetManager.loadBundle(BundleKey[i],
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