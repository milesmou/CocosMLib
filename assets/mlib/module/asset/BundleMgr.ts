import { AssetManager, assetManager, js } from "cc";
import { SingletonFactory } from "../../utils/SingletonFactory";

export class BundleMgr {

    public static get Inst() { return SingletonFactory.getInstance<BundleMgr>(BundleMgr); }

    //bundle名字:Bundle
    private bundles: Map<string, AssetManager.Bundle> = new Map();

    //资源地址:Bundle名字
    private address: Map<string, string> = new Map();
    //资源目录:资源地址数组
    private dirAddress: Map<string, string[]> = new Map();
    //场景地址:Bundle名字
    private scenes: Map<string, string> = new Map();

    protected onInst() {
        this.parseBuiltin();
    }

    private parseBuiltin() {
        this.parseBundle(assetManager.getBundle("resources"));
        this.parseBundle(assetManager.getBundle("main"));
    }

    private parseBundle(bundle: AssetManager.Bundle) {

        if (this.bundles.has(bundle.name)) {
            logger.warn("重复的Bundle名字", bundle.name);
            return;
        }

        this.bundles.set(bundle.name, bundle);
        //普通资源
        bundle["_config"].paths.forEach(v => {
            v.forEach(v1 => {
                let path: string = v1.path;
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
                    logger.error(`资源地址不能重复  ${bundle.name} ${this.address.get(path)} ${v1.path}`);
                }
            });
        });
        //场景资源
        bundle["_config"].scenes.forEach(v => {
            let path: string = v.path;
            let sceneName = path.substring(path.lastIndexOf("/") + 1);
            let location = bundle.name + "/" + sceneName;
            if (this.scenes.has(location)) {
                logger.error(`场景名字不能重复  ${location}`);
            } else {
                this.scenes.set(location, bundle.name);
            }
        });

    }

    public loadBundle(bundleName: string, onFileProgress?: (loaded: number, total: number) => void) {
        let p = new Promise<AssetManager.Bundle>((resolve, reject) => {
            assetManager.loadBundle(bundleName,
                { onFileProgress: onFileProgress },
                (err, bundle) => {
                    if (err) {
                        logger.error(err);
                        reject(err);
                    } else {
                        this.parseBundle(bundle);
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
                            logger.error(err);
                            reject(err)
                        } else {
                            bundleArr.push(bundle);
                            this.parseBundle(bundle);
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

    /** 通过资源地址获取所在的Bundle */
    public getBundle(location: string): AssetManager.Bundle {
        let ab: AssetManager.Bundle = null;
        if (this.address.has(location)) {
            ab = this.bundles.get(this.address.get(location));
            if (!ab) console.error(`location: ${location}  资源所在Bundle未加载`);

        } else {
            console.error(`location: ${location}  资源不存在或所在Bundle未加载`);
        }
        return ab;
    }

    /** 获取目录下所有的资源地址 */
    public getDirectoryAddress(location: string): string[] {
        return this.dirAddress.get(location);
    }

    /** 获取场景所在的Bundle */
    public getSceneBundle(location: string): AssetManager.Bundle {
        let ab: AssetManager.Bundle = null;
        if (this.scenes.has(location)) {
            ab = this.bundles.get(this.scenes.get(location));
            if (!ab) console.error(`location: ${location}  场景所在Bundle未加载`);

        } else {
            console.error(`location: ${location}  场景不存在或所在Bundle未加载`);
        }
        return ab;
    }
}
