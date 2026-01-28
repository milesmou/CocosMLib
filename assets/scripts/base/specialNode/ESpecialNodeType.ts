import { BitMask, Enum } from "cc";
import { EChannel } from "../publish/EChannel";

export const CESpecialNodeTypeLimit = Enum({
    Any: 1,
    All: 2
});

export const ESpecialNodeType = {
    GM: 1 << 0,
    SH: 1 << 1,
    Android: 1 << 2,
    IOS: 1 << 3,
    WechatGame: 1 << 4,
    ByteDanceGame: 1 << 5,
    ZFB: 1 << 6,
    TaoBao: 1 << 7,
    KuaiShou: 1 << 8,
    Blibli: 1 << 9,
}

export const ESpecialNodeTypeNew = {
    GM: 1 << 0,
    SH: 1 << 1,
    ...EChannel
}

export const CBMSpecialNodeType = BitMask(ESpecialNodeType);
export const CBMSpecialNodeTypeNew = BitMask(ESpecialNodeTypeNew);