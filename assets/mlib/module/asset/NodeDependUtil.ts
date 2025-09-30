import { Asset, Component, game, Game, instantiate as moduleInstantiate, Node, Prefab } from "cc";
import { EDITOR_NOT_IN_PREVIEW } from "cc/env";

/** 缓存节点的静态依赖资源 */
const NodeDepends: Map<string, Asset[]> = new Map();

if (!EDITOR_NOT_IN_PREVIEW) {

    /** 重启游戏时清理缓存数据 */
    game.on(Game.EVENT_RESTART, () => {
        NodeDepends.clear();
    });

    //全局自定义instantiate
    globalThis.instantiate = function <T>(obj: Prefab | T): T {
        const newObj = moduleInstantiate(obj);
        if (obj instanceof Prefab) {

        } else if (newObj instanceof Node) {
            addNodeDependsRef(newObj);
        }

        return newObj as any;
    };

    //保存原始destroy
    const originalDestroy = Node.prototype.destroy;
    //重写destroy,在节点销毁时减少引用计数
    Node.prototype.destroy = function () {
        let result = originalDestroy.apply(this);
        let dontRelease = this.getComponent("DontRelease");
        if (!dontRelease) decNodeDependsRef(this);
        return result;
    };


    /** 将节点静态依赖资源引用计数+1 */
    function addNodeDependsRef(node: Node) {
        let depends: Asset[] = [];
        getNodeDepends(node, depends);
        depends.forEach(v => v.addRef());
        NodeDepends.set(node.uuid, depends);
    }

    /** 将节点静态依赖资源引用计数-1 */
    function decNodeDependsRef(node: Node) {
        let depends = NodeDepends.get(node.uuid);
        if (depends) {
            depends.forEach(v => v.decRef());
            NodeDepends.delete(node.uuid);
        }
    }

    /**
     * 获取节点依赖的所有资源
     * - 若节点来自 Prefab，则直接返回 Prefab 资源
     * - 否则递归收集组件和子节点上的资源
     */
    function getNodeDepends(node: Node, result: Asset[]) {
        //判断是否是Prefab实例
        if (isPrefabRoot(node)) {
            result.push((node as any)._prefab.asset);
            return result; //直接返回prefab，不再向下遍历
        }

        //遍历组件，收集依赖的资源
        for (let comp of node.components) {
            collectAssetsFromComp(comp, result);
        }

        //递归子节点
        for (let child of node.children) {
            getNodeDepends(child, result);
        }
    }


    /**
     * 判断是否是Prefab实例的根节点
     */
    function isPrefabRoot(node: Node): boolean {
        const prefabInfo = (node as any)._prefab;
        return !!(prefabInfo && prefabInfo.asset instanceof Prefab && prefabInfo.root === node);
    }

    /**
     * 收集组件依赖的Asset
     */
    function collectAssetsFromComp(comp: Component, result: Asset[]) {
        if (!comp) return;
        const descriptors = Object.getOwnPropertyDescriptors(comp);
        for (let key in descriptors) {
            //跳过构造函数
            if (key === "constructor") continue;
            const desc = descriptors[key];
            //忽略getter/setter
            if (desc.get || desc.set) continue;
            try {
                const val = (comp as any)[key];
                if (typeof val === 'function') continue;
                if (val instanceof Asset) {
                    result.push(val);
                }
            } catch (e) {
                //避免访问异常影响流程
            }
        }
    }
}


/**
 * 全局 instantiate
 */
declare global {
    /** 自定义实例化预制体和克隆节点的方法，包含对资源管理的处理 (可在节点添加DontRelease组件避免自动释放节点依赖资源) */
    function instantiate(prefab: Prefab): Node;
    function instantiate<T>(original: T): T;
}

declare module "cc" {
    /**
     * CocosCreator自带的实例化预制体和克隆节点的方法
     * @deprecated 请使用全局的instantiate方法，而不是从cc模块导出的
     */
    export function instantiate(prefab: Prefab): Node;
}