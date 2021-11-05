import { BundleKey, BundleMgr } from "./BundleMgr";
import IComponent from "../component/IComponent";
import { PoolKey } from "./PoolMgr";
import { app } from "../App";

/*

cocos creator 2.4.x 资源释放问题

cc.assetManager.releaseAsset  释放指定资源及其依赖资源的引用计数为-1,同时会释放其依赖的引用计数为0的贴图、音频等

cc.resources.release  在指定的Bundle找到对应的Asset,然后调用cc.assetManager.releaseAsset

动态加载的资源 引用计数需要自己手动管理 引用计数+1:asset.addRef  引用计数-1并尝试释放资源:asset.decRef

使用注意: 
1. 项目中任何资源加载的借口均使用ResMgr中的接口
2. 所有动态加载的节点资源都必须通过实例化预制体创建(自动或手动控制引用计数,引用计数为0时释放预制体资源),不能直接克隆节点(不方便控制引用计数)
3. 预制体根节点脚本必须继承IComponent(脚本内有自动和手动管理引用计数的一些方法)
4. 若预制体根节点无脚本使用ResMgr.loadNode加载
5. 加载图片使用ResMgr.loadPicture加载
6. 通过ResMgr其它接口(load、loadDir、loadArray、loadRemote)加载的资源需要手动管理引用计数
*/

/** 资源加载工具类,替代引擎的资源加载,方便控制资源释放 */
export class ResMgr {

    /**
    * 加载图片到Sprite
    * @param sprite 目标Sprite组件
    * @param url 路径（本地路径不带扩展名 远程路径带扩展名）
    * @param lifeRef 生命周期依赖节点的脚本(管理动态加载图片的引用计数)
    * @param decRefOld 是否立即decRef精灵原来的图片
    * @param bundleKey 从哪个AssetBundle加载本地图片 默认为resources
    */
    static loadPicture(sprite: cc.Sprite, url: string, lifeRef: IComponent, decRefOld = true, bundleKey?: BundleKey) {
        let p = new Promise<void>((resolve, reject) => {
            let onComplete = (err, res: cc.SpriteFrame | cc.Texture2D) => {
                if (!sprite?.isValid) return;
                if (err) {
                    cc.error(err);
                    reject();
                } else {
                    let oldAsset = sprite.spriteFrame;
                    if (res instanceof cc.Texture2D) {
                        let spFrame = new cc.SpriteFrame(res);
                        if (oldAsset?.name != spFrame.name) {
                            lifeRef?.addDynamicAsset(spFrame);
                            sprite.spriteFrame = spFrame;
                            decRefOld && lifeRef?.removeDynamicAsset(oldAsset);
                        }
                    } else {
                        if (oldAsset?.name != res.name) {
                            lifeRef?.addDynamicAsset(res);
                            sprite.spriteFrame = res;
                            decRefOld && lifeRef?.removeDynamicAsset(oldAsset);
                        }
                    }
                    resolve();
                }
            };
            if (url.startsWith("http")) {
                cc.assetManager.loadRemote(url, onComplete);
            } else {
                let bundle = bundleKey ? BundleMgr.Inst.getBundle(bundleKey) : cc.resources;
                if (bundle) {
                    bundle.load(url, cc.SpriteFrame, onComplete);
                } else {
                    cc.error(bundleKey + " bundle不存在");
                    reject(bundleKey + " bundle不存在");
                }
            }

        })
        return p;
    }

    /**
     * 加载一个预制体节点到指定节点下(针对跟节点无脚本的静态预制体)
     * @param parent 预制体的父节点(默认应该是没有任何子节点的空节点)
     * @param prefab 预制体加载路径
     * @param lifeRef 生命周期依赖节点的脚本(管理动态加载节点的引用计数)
     * @param bundleKey 从哪个AssetBundle加载预制体
     */
    static loadNode(parent: cc.Node, prefab: string, lifeRef: IComponent, bundleKey?: BundleKey) {
        let bundle = bundleKey ? BundleMgr.Inst.getBundle(bundleKey) : cc.resources;
        if (!bundle) {
            cc.error(bundleKey + " bundle不存在");
            return;
        }
        let oldNode = parent.children[0];
        let oldAsset = (oldNode as any)?._prefab?.asset;
        let _uuid = bundle.getInfoWithPath(prefab)?.uuid;
        if (oldAsset?._uuid == _uuid) return;
        oldNode?.destroy();
        let p = new Promise<cc.Node>((resolve, reject) => {
            bundle.load(prefab, cc.Prefab, (err, asset: cc.Prefab) => {
                if (err) {
                    cc.error(err);
                    reject(err);
                } else {
                    let newNode = cc.instantiate(asset);
                    lifeRef && lifeRef.addDynamicAsset(asset);
                    !lifeRef && asset.addRef();
                    newNode.parent = parent;
                    !lifeRef && oldAsset?.decRef();
                    lifeRef && lifeRef.removeDynamicAsset(oldAsset);
                    resolve(newNode);
                }
            });
        })
        return p;
    }

    /**
     * 分帧加载一个列表
     * @param params prefab:预制体加载路径、对象池key、传空值表示克隆第一个子节点;  对content下多余的item的处理  dt分帧加载每帧耗时(毫秒)
     */
    static async loadItemList<T>(dataList: T[], content: cc.Node, execute: (data: T, item: cc.Node, index?: number) => void, params: { prefab: string | PoolKey, dt?: number, onComplete?: () => void }) {
        dataList = dataList || [];
        let { prefab, dt, onComplete } = params || {};
        if (content.childrenCount > dataList.length) {
            let toDeal = content.children.slice(dataList.length);
            if (!prefab || typeof prefab === "string") {
                toDeal.forEach(v => v.active = false);
            } else {
                app.pool.put(prefab, toDeal);
            }
        }
        let p: cc.Prefab;
        if (prefab && typeof prefab === "string") {
            p = await this.load(prefab, cc.Prefab);
        }
        let gen = function* () {
            for (let i = 0; i < dataList.length; i++) {
                const v = dataList[i];
                let func = () => {
                    if (!content?.isValid) return;
                    let itemNode = content.children[i];
                    if (!itemNode) {
                        if (!prefab) {
                            itemNode = cc.instantiate(content.children[0]);
                        } else if (typeof prefab === "string") {
                            itemNode = cc.instantiate(p);
                        } else {
                            itemNode = app.pool.get(prefab);
                        }
                        itemNode.parent = content;
                    }
                    itemNode.active = true;
                    execute && execute(v, itemNode, i);
                }
                yield func;
            }
        }();
        this.frameLoad(gen, dt || 4).then(() => {
            onComplete && onComplete();
        });
    }

    /**
     * 分帧加载
     * @param gen 迭代器
     * @param target 执行分帧加载的组件
     * @param dt 每帧耗时(毫秒)
     */
    static frameLoad(gen: Generator, dt = 4) {
        let p = new Promise<void>((resolve, reject) => {
            let execute = () => {
                let d1 = Date.now();
                for (let e = gen.next(); ; e = gen.next()) {
                    if (!e || e.done) {
                        resolve();
                        break;
                    }
                    if (typeof e.value == "function") {
                        e.value();
                    }
                    let d2 = Date.now();
                    if (d2 - d1 >= dt) {
                        new cc.Component().scheduleOnce(execute);
                        break;
                    }
                }
            }
            execute();
        });
        return p;
    }

    /**
     * 获取在某个指定文件夹下的所有资源信息
     */
    static getDirWithPath<T extends cc.Asset>(path: string, type?: { new(): T }, bundleKey?: BundleKey) {
        let bundle = bundleKey ? BundleMgr.Inst.getBundle(bundleKey) : cc.resources;
        return bundle.getDirWithPath(path, type as any);
    }

    /**
     * 将 AssetBundle load Promise化
     */
    static load<T extends cc.Asset>(path: string, type?: { new(): T }, onProgress?: (finish: number, total: number) => void, bundleKey?: BundleKey): Promise<T> {
        let bundle = bundleKey ? BundleMgr.Inst.getBundle(bundleKey) : cc.resources;
        if (!bundle) {
            cc.error(bundleKey + " bundle不存在");
            return;
        }
        let p = new Promise<T>((resolve, reject) => {
            bundle.load(path, type as any, onProgress, (err, asset: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(asset);
                }
            })
        })
        return p;
    }

    /**
     * 将 AssetBundle load Promise化
     */
    static loadArray(path: string[], type?: typeof cc.Asset, onProgress?: (finish: number, total: number) => void, bundleKey?: BundleKey): Promise<cc.Asset[]> {
        let bundle = bundleKey ? BundleMgr.Inst.getBundle(bundleKey) : cc.resources;
        if (!bundle) {
            cc.error(bundleKey + " bundle不存在");
            return;
        }
        let p = new Promise<cc.Asset[]>((resolve, reject) => {
            bundle.load(path, type, onProgress, (err, assets) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(assets);
                }
            })
        })
        return p;
    }

    /**
  * 将 cc.assetManager.loadRemote Promise化
  */
    static loadRemote(path: string): Promise<cc.Asset> {
        let p = new Promise<cc.Asset>((resolve, reject) => {
            cc.assetManager.loadRemote(path, (err, asset) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(asset);
                }
            })
        })
        return p;
    }

    /**
    * 将 AssetBundle loadDir Promise化
    */
    static loadDir(path: string, onProgress?: (finish: number, total: number) => void, bundleKey?: BundleKey): Promise<cc.Asset[]> {
        let bundle = bundleKey ? BundleMgr.Inst.getBundle(bundleKey) : cc.resources;
        if (!bundle) {
            cc.error(bundleKey + " bundle不存在");
            return;
        }
        let p = new Promise<cc.Asset[]>((resolve, reject) => {
            bundle.loadDir(path, onProgress, (err, assets) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(assets);
                }
            })
        })
        return p;
    }

    private static downloadProgress: Map<string, Function[]> = new Map();
    /**
     * 下载文件  原生平台下载文件到本地 浏览器加载资源
     * @param url 文件下载链接
     * @param onFileProgress 文件下载进度回调
     */
    static download(url: string, onFileProgress?: (loaded: number, total: number) => void) {
        if (cc.sys.isBrowser) {
            return this.loadRemote(url);
        } else {
            let ext = url.substr(url.lastIndexOf("."));
            if (!this.downloadProgress.get(url)) {
                this.downloadProgress.set(url, []);
            }
            if (onFileProgress) {
                this.downloadProgress.get(url).push(onFileProgress);
            }
            let p = new Promise<any>((resolve, reject) => {
                cc.assetManager.downloader.download(
                    url, url, ext,
                    {
                        onFileProgress: (loaded: number, total: number) => {
                            let arr = this.downloadProgress.get(url);
                            arr.forEach(v => v(loaded, total));
                        }
                    },
                    (err, res) => {
                        this.downloadProgress.delete(url);
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res);
                        }
                    }
                )
            })
            return p;
        }
    }
}