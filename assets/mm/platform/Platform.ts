export const EPlatform = cc.Enum({
    Debug: 0,
    GooglePlay: 1,
});

export interface IPlatform {
    showRewardedVideo(params?: { id?: number, success?: Function, fail?: Function, error?: Function, show?: Function, complete?: Function });
    showBanner(params?: { id?: number, pos: cc.Vec2, success?: Function, fail?: Function, error?: Function });
    showInterstitial(params?: { id?: number, success?: Function, fail?: Function, error?: Function });
    reqInternalPay(skuId: string, params?: { success?: Function, fail?: Function, error?: Function, complete?: Function });
    reportCustomEvent(event: string, args?: { [key: string]: any });
}


export class Platform implements IPlatform {
    showBanner() { }
    showRewardedVideo(params?) {
        console.log("测试：视频观看完成");
    }
    showInterstitial() { }
    reqInternalPay(skuid: string, params) {
        console.log("测试：支付成功 \n" + skuid);
    }
    reportCustomEvent(event, args) { }

    public static getPlatformInst(platformId: number): IPlatform {
        if (cc.sys.platform == cc.sys.ANDROID && platformId == EPlatform.GooglePlay) {
            // return new GooglePlay();
        }
        return new Platform();
    }
}
