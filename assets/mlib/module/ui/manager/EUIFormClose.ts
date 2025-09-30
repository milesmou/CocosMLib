import { Enum } from "cc";

/** 界面关闭时的操作 */
export const EUIFormClose = Enum({
    /** 不做任何处理 */
    NONE: 0,
    /** 销毁界面节点 */
    Destroy: 1,
    /** 销毁界面节点并释放资源(包含界面预制体和界面资源组件动态加载的资源) */
    Release: 2,
})