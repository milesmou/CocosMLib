import { UIConstant } from "../../gen/UIConstant";

export enum EWaitShowType {
    /** 不显示 */
    None,
    /** 第一次加载的时候显示 */
    First,
    /** 除了第一次，后面每次都显示 */
    ExceptFirst,
    /** 每次加载的时候都显示 */
    Always
}

export interface WaitCfgInfo {
    /** 展示的时机 */
    showType: EWaitShowType;
    /** 最少展示时间 单位秒 0表示加载完成后立即关闭 */
    showDuration: number;
    
}


/** 配置打开UI时 是否显示等待加载的界面 */
export const UIWaitCfg: { [key: string]: WaitCfgInfo } = {
    [UIConstant.UIHUD]: { showType: EWaitShowType.ExceptFirst, showDuration: 0.5 },
    // [UIConstant.UIInventory]: { showType: EWaitShowType.First, showDuration: 0.25 },
    // [UIConstant.UICountryTown]: { showType: EWaitShowType.Always, showDuration: 0.5 },
    // [UIConstant.UIPort]: { showType: EWaitShowType.Always, showDuration: 0.5 }
}