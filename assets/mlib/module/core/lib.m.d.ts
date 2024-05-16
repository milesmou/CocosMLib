import "cc";
import { App } from "../../App";
import { MLogger } from "../logger/MLogger";

//扩展CC中的一些类
declare module "cc" {
    interface Component extends CCObject {
        /** 
         * 从任意父节点上获取组件
         * @param includeSlef 是否包含自身所在节点 默认为true
         */
        getComponentInParent<T extends Component>(classConstructor: new (...args: any[]) => T, includeSlef?: boolean);
    }

    export namespace sp {
        interface Skeleton {
            /** 设置组timescale(统一控制多个spine的播放速度) */
            setGTimeScale(value: number): void;
        }
    }

    interface AnimationState {
        /** 设置组timescale(统一控制多个animation的播放速度) */
        setGTimeScale(value: number): void;
    }
}

declare global {

    /** 将属性注册到全局 */
    const registerToGlobal: (key: string, value: any) => void;
    /** 应用程序管理单例 */
    const app: App;
    /** 日志打印类 */
    const logger: typeof MLogger;


    interface Array<T> {
        /**
         * 从数组中删除一个元素
         */
        delete<T>(item: T): boolean;
        /**
         * 从数组中删除一个元素
         */
        delete<T>(predicate: (value: T, index: number, obj: T[]) => boolean): boolean;
        /**
         * 第一个元素
         */
        get first(): T;
        /** 
         * 最后一个元素
         */
        get last(): T;
        /**
         * 数组随机打乱
         */
        disarrange();
    }

    interface String {
        /**
         * 首字母大写
         */
        upperFirst(): string;
        /**
         * 首字母小写 
         */
        lowerFirst(): string;
    }
}