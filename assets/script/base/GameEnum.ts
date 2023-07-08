//枚举定义类

import { Enum } from "cc";

/** 打包渠道枚举 */
export const EChannel = Enum({
    Debug: 0,
    GooglePlay: 1,
});

/** 事件枚举 */
export enum EventKey {
    //基础事件
    ShowUI,
    HideUI,
    OnUIInitBegin,
    OnUIShowBegin,
    OnUIHideBegin,
    OnUIShow,
    OnUIHide,
    OnInventoryChange,
    //其它事件

}

/**
 * 引导枚举
 */
export enum EGuideType {
    PlayCrushGame = 1,
    PlayTurntable = 2,
}