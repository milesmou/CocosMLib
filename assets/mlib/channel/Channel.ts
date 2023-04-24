import { _decorator, Enum, Vec2, sys } from 'cc';
import { WeChatMini } from './WeChatMini';

export const EChannel = Enum({
    Debug: 0,
    GooglePlay: 1,
});

export interface IChannel {
    showRewardedVideo(params?: { id?: number, suss?: Function, fail?: Function, error?: Function, show?: Function, complete?: Function }): void;
    showBanner(params?: { id?: number, pos: Vec2, suss?: Function, fail?: Function, error?: Function }): void;
    showInterstitial(params?: { id?: number, suss?: Function, fail?: Function, error?: Function }): void;
    reqInternalPay(skuId: string, params?: { suss?: Function, fail?: Function, error?: Function, complete?: Function }): void;
    reportCustomEvent(event: string, args?: { [key: string]: any }): void;
}

export class Channel implements IChannel {
    showBanner() { }
    showRewardedVideo(params?: any) {
        //console.log("测试：视频观看完成");
    }
    showInterstitial() { }
    reqInternalPay(skuid: string, params: any) {
        //console.log("测试：支付成功 \n" + skuid);
    }
    reportCustomEvent(event: string, args: any) { }
    public static getPlatformInst(platformId: number): IChannel {
        if (sys.platform == sys.Platform.ANDROID && platformId == EChannel.GooglePlay) {
            return new WeChatMini();
        }
        return new Channel();
    }
}