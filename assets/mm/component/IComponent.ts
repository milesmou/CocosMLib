const { ccclass, property } = cc._decorator;

@ccclass
export default class IComponent extends cc.Component {

    public dynamicAsset: cc.Asset[] = [];
    public dynamicNode: cc.Node[] = [];

    /* 引用计数操作标志,避免手动和自动重复操作 */
    private isAddRef = false;
    private isDecRef = false;


    /** 预制体引用计数+1 整个生命周期只会执行一次 (游离节点需要手动调用) */
    public addRef() {
        if (!this.isAddRef) {
            this.isAddRef = true;
            let asset: cc.Asset = (this.node as any)?.mm_prefab;
            asset?.addRef();//节点实例化后 引用计数+1
        }
    }

    /** 预制体引用计数-1 整个生命周期只会执行一次 (游离节点需要手动调用) */
    public decRef() {
        if (!this.isDecRef) {
            this.isDecRef = true;
            let asset: cc.Asset = (this.node as any)?.mm_prefab;
            asset?.decRef();//节点销毁后 动态加载资源引用计数-1
        }
    }

    /** 添加动态加载的资源将它们的引用计数+1 根据组件的生命周期管理它的引用计数 */
    public addDynamicAsset(asset: cc.Asset) {
        if (!asset) return;
        if (!this.isValid) return;
        if (!this.dynamicAsset.includes(asset)) {
            asset.addRef();
            this.dynamicAsset.push(asset);
        }
    }

    /** 移除动态加载的资源将它们的引用计数-1 根据组件的生命周期管理它的引用计数 */
    public removeDynamicAsset(asset: cc.Asset) {
        if (!asset) return;
        if (!this.isValid) return;
        let index = this.dynamicAsset.indexOf(asset)
        if (index > -1) {
            asset.decRef();
            this.dynamicAsset.splice(index, 1);
        }
    }

    /** 添加动态加载的节点将它们的预制体引用计数+1 根据组件的生命周期管理它的引用计数 */
    public addDynamicNode(node: cc.Node) {
        if (!node || !node['mm_prefab'] || !(node['mm_prefab'] instanceof cc.Prefab)) return;
        if (!this.isValid) return;
        if (!this.dynamicNode.includes(node)) {
            let prefab: cc.Prefab = node['mm_prefab'];
            prefab.addRef();
            this.dynamicNode.push(node);
        }
    }

    /** 移除动态加载的节点将它们的预制体引用计数-1 根据组件的生命周期管理它的引用计数 */
    public removeDynamicNode(node: cc.Node) {
        if (!node || !node['mm_prefab'] || !(node['mm_prefab'] instanceof cc.Prefab)) return;
        if (!this.isValid) return;
        let index = this.dynamicNode.indexOf(node)
        if (index > -1) {
            let prefab: cc.Prefab = node['mm_prefab'];
            node.destroy();
            node.removeFromParent();
            prefab.decRef();
            this.dynamicAsset.splice(index, 1);
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
            for (const v of this.dynamicAsset) {
                v.decRef();
            }
            for (const v of this.dynamicNode) {
                if(v.isValid)
                v['mm_prefab'].decRef();
            }
            this.decRef();
        }
    }

}
