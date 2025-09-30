import { sys } from "cc";
import { EChannel } from "../publish/EChannel";
import { ESpecialNodeType, ESpecialNodeTypeLimit } from "./ESpecialNodeType";

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
        this._isZFB = mGameSetting.channelId == EChannel.ZFB_ZQY;
        this._isKuaiShou = mGameSetting.channelId == EChannel.KS_ZQY;
    }

    /** 获取特殊节点的激活状态 */
    public getActive(bitValue: number, typeLimit = ESpecialNodeTypeLimit.Any): boolean {

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

        if (typeLimit == ESpecialNodeTypeLimit.Any) {
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
}