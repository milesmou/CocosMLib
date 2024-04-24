import { Enum } from "cc";

export enum ESpecialNodeType {
    None,
    GM,
    SH,
    Android,
    IOS,
    WechatGame,
    ByteDanceGame,
}

export const CESpecialNodeType = Enum(ESpecialNodeType)

