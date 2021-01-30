/** 自定义全局变量 */
declare var mm: {
    /** 配置对象 */
    config: IConfig,
    /** 系统语言 */
    lang: string;
    /** 平台兼容抽象对象，根据对运行环境的检测，创建对应平台类的实例 */
    platform: IPlatform;
    /** 设备安全区域到屏幕四边的间距和安全区域大小 */
    safeSize: { top: number, bottom: number, left: number, right: number, width: number, height: number };
}

interface IConfig {
    /** 平台名字，区分当前上架到哪个平台*/
    platformName: string;
    version: string;
    url: string;
    urlVideo: string;
    urlAlbum: string;
    urlSound: string;
}

interface IPlatform {
    adCfg: { [type: string]: { [id: number]: string } };
    login(obj?);
    showRewardedVideo(params?: { id?: number, success?: Function?, fail?: Function, error?: Function, show?: Function, complete?: Function });
    showBanner(params?: { id?: number, pos: cc.Vec2, success?: Function?, fail?: Function, error?: Function });
    showInterstitial(params?: { id?: number, success?: Function?, fail?: Function, error?: Function });
    reqInternalPay(skuId: string, params?: { success?: Function?, fail?: Function, error?: Function, complete?: Function });
    reportCustomEvent(event: string, args?: { [key: string]: any });
}