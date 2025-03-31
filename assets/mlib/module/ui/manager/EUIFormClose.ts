import { Enum } from "cc";

/** 界面关闭时的操作 */
export const EUIFormClose = Enum({
    /** 不做任何处理 */
    NONE: 0,
    /** 销毁界面节点 */
    Destroy: 1,
    /** 销毁界面节点并释放预制体资源 */
    DestroyAndRelease: 2,
})