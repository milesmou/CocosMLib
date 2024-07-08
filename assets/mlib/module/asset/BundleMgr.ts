import { AssetManager, assetManager, js } from "cc";
import { SingletonFactory } from "../../utils/SingletonFactory";

export class BundleMgr {

    public static get Inst() { return SingletonFactory.getInstance<BundleMgr>(BundleMgr); }

    //bundle名字:Bundle
    private _bundles: Map<string, AssetManager.Bundle> = new Map();

    //资源地址:Bundle名字
    private _address: Map<string, string> = new Map();
    //资源目录:资源地址数组
    private _dirAddress: Map<string, string[]> = new Map();
    //场景地址:Bundle名字
    private _scenes: Map<string, string> = new Map();

    protected onInst() {
        this.parseBuiltin();
    }

    private parseBuiltin() {
        this.parseBundle(assetManager.getBundle("resources"));
        this.parseBundle(assetManager.getBundle("main"));
    }

    private parseBundle(bundle: AssetManager.Bundle) {

        if (this._bundles.has(bundle.name)) {
            console.warn("重复的Bundle名字", bundle.name);
            return;
        }

        this._bundles.set(bundle.name, bundle);
        //普通资源
        bundle["_config"].paths.forEach(v => {
            v.forEach(v1 => {
                let path: string = v1.path;

                let dir = path.substring(0, path.lastIndexOf("/"));
                if (!this._dirAddress.get(dir)) this._dirAddress.set(dir, []);//记录相同目录下的所有资源

                let typeName = js.getClassName(v1.ctor);
                if (v.length > 1 && typeName != "cc.ImageAsset") {//对同名的多个资源添加类型后缀
                    path = path + "/" + js.getClassName(v1.ctor);
                }
                this._dirAddress.get(dir).push(path);

                if (!this._address.has(path)) {
                    this._address.set(path, bundle.name);
                }
                else {
                    console.error(`资源地址不能重复  ${bundle.name} ${this._address.get(path)} ${v1.path}`);
                }
            });
        });
        //场景资源
        bundle["_config"].scenes.forEach(v => {
            let path: string = v.path;
            let sceneName = path.substring(path.lastIndexOf("/") + 1);
            let location = bundle.name + "/" + sceneName;
            if (this._scenes.has(location)) {
                console.error(`场景名字不能重复  ${location}`);
            } else {
                this._scenes.set(location, bundle.name);
            }
        });

    }

    /** 加载Bundle(实际是加载Bundle的清单文件)  */
    public loadBundle(bundleName: string) {
        let p = new Promise<AssetManager.Bundle>((resolve, reject) => {
            assetManager.loadBundle(bundleName,
                {},
                (err, bundle) => {
                    if (err) {
                        console.error(err);
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

    /** 加载多个Bundle */
    public async loadBundles(bundleNames: string[], onProgress?: (loaded: number, total: number) => void) {
        let bundleArr: AssetManager.Bundle[] = [];

        for (let i = 0; i < bundleNames.length; i++) {
            let bundleName = bundleNames[i];
            let bundle = await this.loadBundle(bundleName);
            bundleArr.push(bundle);
            onProgress && onProgress(i + 1, bundleNames.length);
        }

        return bundleArr;
    }

    /** 资源是否存在 */
    public isAssetExists(location: string) {
        return this._address.has(location);
    }

    /** 通过资源地址获取所在的Bundle */
    public getBundle(location: string): AssetManager.Bundle {
        let ab: AssetManager.Bundle = null;
        if (this._address.has(location)) {
            ab = this._bundles.get(this._address.get(location));
            if (!ab) console.error(`location: ${location}  资源所在Bundle未加载`);

        } else {
            console.error(`location: ${location}  资源不存在或所在Bundle未加载`);
        }
        return ab;
    }

    /** 获取目录下所有的资源地址 */
    public getDirectoryAddress(location: string): string[] {
        return this._dirAddress.get(location);
    }

    /** 获取场景所在的Bundle */
    public getSceneBundle(location: string): AssetManager.Bundle {
        let ab: AssetManager.Bundle = null;
        if (this._scenes.has(location)) {
            ab = this._bundles.get(this._scenes.get(location));
            if (!ab) console.error(`location: ${location}  场景所在Bundle未加载`);

        } else {
            console.error(`location: ${location}  场景不存在或所在Bundle未加载`);
        }
        return ab;
    }
}
