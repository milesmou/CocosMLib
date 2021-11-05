const { ccclass, property } = cc._decorator;

@ccclass
export default class IComponent extends cc.Component {
    public dynamicLoadedAsset: cc.Asset[] = [];

    /* 引用计数操作标志,避免手动和自动重复操作 */
    private isAddRef = false;
    private isDecRef = false;

    /** 预制体引用计数+1 整个生命周期只会执行一次 (游离节点需要手动调用) */
    public addRef() {
        if (!this.isAddRef) {
            this.isAddRef = true;
            let asset: cc.Asset = (this.node as any)?._prefab?.asset;
            asset?.addRef();//节点实例化后 引用计数+1
        }
    }

    /** 预制体引用计数-1 整个生命周期只会执行一次 (游离节点需要手动调用) */
    public decRef() {
        if (!this.isDecRef) {
            this.isDecRef = true;
            let asset: cc.Asset = (this.node as any)?._prefab?.asset;
            asset?.decRef();//节点销毁后 动态加载资源引用计数-1
        }
    }

    /** 添加动态加载的资源将它们的引用计数+1 根据组件的生命周期管理它的引用计数 */
    public addDynamicAsset(asset: cc.Asset) {
        if (!asset) return;
        if (!this.isValid) return;
        if (!this.dynamicLoadedAsset.includes(asset)) {
            asset.addRef();
            this.dynamicLoadedAsset.push(asset);
        }
    }

    /** 移除动态加载的资源将它们的引用计数-1 根据组件的生命周期管理它的引用计数 */
    public removeDynamicAsset(asset: cc.Asset) {
        if (!asset) return;
        if (!this.isValid) return;
        let index = this.dynamicLoadedAsset.indexOf(asset)
        if (index > -1) {
            asset.decRef();
            this.dynamicLoadedAsset.splice(index, 1);
        }
    }

    constructor() {
        super();
        let onLoad = this.onLoad;
        let onDestroy = this.onDestroy;
        this.onLoad = function () {
            onLoad && onLoad.call(this);
            this.addRef();
        }
        this.onDestroy = function () {
            onDestroy && onDestroy.call(this);
            for (const v of this.dynamicLoadedAsset) {
                v.decRef();
            }
            this.decRef();
        }
    }

}
