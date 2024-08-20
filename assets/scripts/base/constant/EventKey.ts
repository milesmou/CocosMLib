/** 游戏中的事件枚举 */
const enum EventKey {
    //#region 基础事件,不可更改
    Builtin = -1000000,
    ShowUI,
    HideUI,
    OnUIInitBegin,
    OnUIShowBegin,
    OnUIHideBegin,
    OnUIShow,
    OnUIHide,
    SpecialNodeChange,
    OnInventoryChange,
    OnTaskChange,
    ShowGuide,
    OnGuideStart,
    ManualGuideStep,
    OnGuideEnd,
    //#endregion
}

///@ts-ignore
globalThis.mEventKey = EventKey;
export { };
declare global {
    /** 游戏中的事件枚举 */
    const mEventKey: typeof EventKey;
}
