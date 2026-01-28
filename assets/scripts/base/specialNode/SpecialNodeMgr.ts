import { sys } from "cc";
import { EChannel } from "../publish/EChannel";
import { CESpecialNodeTypeLimit, ESpecialNodeType, ESpecialNodeTypeNew } from "./ESpecialNodeType";

export class SpecialNodeMgr {


    public static get Inst() { return createSingleton(SpecialNodeMgr); }

    private _isAndroid: boolean;
    private _isIOS: boolean;
    private _isWechatGame: boolean;
    private _isByteDanceGame: boolean;
    private _isZFB: boolean;
    private _isTaoBao: boolean;
    private _isKuaiShou: boolean;
    private _isBlibli: boolean;

    protected onCreate() {
        this._isAndroid = sys.platform == sys.Platform.ANDROID;
        this._isIOS = sys.platform == sys.Platform.IOS;
        this._isWechatGame = mGameSetting.channelId == EChannel.WX_ZQY || mGameSetting.channelId == EChannel.WX_YXT;
        this._isByteDanceGame = mGameSetting.channelId == EChannel.DY_ZQY || mGameSetting.channelId == EChannel.DY_YXT2;
        this._isZFB = false;
        this._isKuaiShou = false;
    }

    /** 获取特殊节点的激活状态 */
    public getActive(bitValue: number, typeLimit = CESpecialNodeTypeLimit.Any): boolean {

        let gm = bitValue & ESpecialNodeType.GM;
        let sh = bitValue & ESpecialNodeType.SH;
        let android = bitValue & ESpecialNodeType.Android;
        let ios = bitValue & ESpecialNodeType.IOS;
        let wechatGame = bitValue & ESpecialNodeType.WechatGame;
        let byteDanceGame = bitValue & ESpecialNodeType.ByteDanceGame;
        let zfb = bitValue & ESpecialNodeType.ZFB;
        let taoBao = bitValue & ESpecialNodeType.TaoBao;
        let kuaiShou = bitValue & ESpecialNodeType.KuaiShou;
        let blibli = bitValue & ESpecialNodeType.Blibli;

        if (typeLimit == CESpecialNodeTypeLimit.Any) {
            if (gm && mGameConfig.gm) return true;
            if (sh && mGameConfig.sh) return true;
            if (android && this._isAndroid) return true;
            if (ios && this._isIOS) return true;
            if (wechatGame && this._isWechatGame) return true;
            if (byteDanceGame && this._isByteDanceGame) return true;
            if (zfb && this._isZFB) return true;
            if (taoBao && this._isTaoBao) return true;
            if (kuaiShou && this._isKuaiShou) return true;
            if (blibli && this._isBlibli) return true;
            return false;
        } else {
            let value = true;
            if (value && gm) value = value && mGameConfig.gm;
            if (value && sh) value = value && mGameConfig.sh;
            if (value && android) value = value && this._isAndroid;
            if (value && ios) value = value && this._isIOS;
            if (value && wechatGame) value = value && this._isWechatGame;
            if (value && byteDanceGame) value = value && this._isByteDanceGame;
            if (value && zfb) value = value && this._isZFB;
            if (value && taoBao) value = value && this._isTaoBao;
            if (value && kuaiShou) value = value && this._isKuaiShou;
            if (value && blibli) value = value && this._isBlibli;
            return value;
        }
    }

    public getActiveNew(bitValue: number, typeLimit = CESpecialNodeTypeLimit.Any): boolean {

        let gm = bitValue & ESpecialNodeTypeNew.GM;
        let sh = bitValue & ESpecialNodeTypeNew.SH;
        let cDev = bitValue & ESpecialNodeTypeNew.Dev;
        let cOutTest = bitValue & ESpecialNodeTypeNew.OutTest;
        let cDyZqy = bitValue & ESpecialNodeTypeNew.DY_ZQY;
        let cWxZqy = bitValue & ESpecialNodeTypeNew.WX_ZQY;
        let cDyYxt2 = bitValue & ESpecialNodeTypeNew.DY_YXT2;
        let cWxYxt = bitValue & ESpecialNodeTypeNew.WX_YXT;
        let cIosCnYb = bitValue & ESpecialNodeTypeNew.IOSCN_YB;
        let cAzCnYb = bitValue & ESpecialNodeTypeNew.AZCN_YB;

        if (typeLimit == CESpecialNodeTypeLimit.Any) {
            if (gm && mGameConfig.gm) return true;
            if (sh && mGameConfig.sh) return true;
            if (cDev && mGameSetting.channelId == EChannel.Dev) return true;
            if (cOutTest && mGameSetting.channelId == EChannel.OutTest) return true;
            if (cDyZqy && mGameSetting.channelId == EChannel.DY_ZQY) return true;
            if (cWxZqy && mGameSetting.channelId == EChannel.WX_ZQY) return true;
            if (cDyYxt2 && mGameSetting.channelId == EChannel.DY_YXT2) return true;
            if (cWxYxt && mGameSetting.channelId == EChannel.WX_YXT) return true;
            if (cIosCnYb && mGameSetting.channelId == EChannel.IOSCN_YB) return true;
            if (cAzCnYb && mGameSetting.channelId == EChannel.AZCN_YB) return true;
            return false;
        } else {
            let value = true;
            if (value && gm) value = value && mGameConfig.gm;
            if (value && sh) value = value && mGameConfig.sh;
            if (value && cDev) value = value && mGameSetting.channelId == EChannel.Dev;
            if (value && cOutTest) value = value && mGameSetting.channelId == EChannel.OutTest;
            if (value && cDyZqy) value = value && mGameSetting.channelId == EChannel.DY_ZQY;
            if (value && cDyYxt2) value = value && mGameSetting.channelId == EChannel.DY_YXT2;
            if (value && cWxYxt) value = value && mGameSetting.channelId == EChannel.WX_YXT;
            if (value && cIosCnYb) value = value && mGameSetting.channelId == EChannel.IOSCN_YB;
            if (value && cAzCnYb) value = value && mGameSetting.channelId == EChannel.AZCN_YB;
            return value;
        }
    }
}