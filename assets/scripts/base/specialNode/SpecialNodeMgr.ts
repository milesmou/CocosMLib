import { sys } from "cc";
import { SingletonFactory } from "../../../mlib/utils/SingletonFactory";
import { GameConfig } from "../GameConfig";
import { GameData } from "../GameData";
import { ESpecialNodeType } from "./ESpecialNodeType";
import { App } from "../../../mlib/App";
import { GameSetting } from "../../../mlib/GameSetting";
import { EChannel } from "../publish/EChannel";

export class SpecialNodeMgr {
    public static get Inst() { return SingletonFactory.getInstance(SpecialNodeMgr); }
    protected onInst() {

    }

    /** 获取特殊节点的激活状态 */
    public getActive(specialNodeType: ESpecialNodeType): boolean {
        switch (specialNodeType) {
            case ESpecialNodeType.GM:
                return GameConfig.gm;
            case ESpecialNodeType.SH:
                return GameConfig.sh;
            case ESpecialNodeType.Android:
                return sys.platform == sys.Platform.ANDROID;
            case ESpecialNodeType.IOS:
                return sys.platform == sys.Platform.IOS;
            case ESpecialNodeType.WechatGame:
                return sys.platform == sys.Platform.WECHAT_GAME;
            case ESpecialNodeType.ByteDanceGame:
                return sys.platform == sys.Platform.BYTEDANCE_MINI_GAME;

        }
        return true;
    }

    /** 获取特殊节点的透明度 */
    public getOpacity(specialNodeType: ESpecialNodeType): number {
        // if (specialNodeType == ESpecialNodeType.GM) {
        //     if (GameData.Inst.isShowGmBtns) {
        //         return 255;
        //     } else {
        //         return 0;
        //     }
        // }
        return 255;
    }

}