/** SDK需要用到的一些临时变量 */
export class SDKTemp {
    /** 本次激励视频的参数 */
    public static rewardedVideoParams: RewardedVideoParams;
    /** 本次内购的参数 */
    public static payParams: PayParams;
    /** 本次上传存档的参数 */
    public static saveGameDataParams: SaveGameDataParams;
}

/** SDK相关的回调 */
export class SDKCallback {
    /** 通用的回调 */
    public static callback: Map<string, (args: string) => void> = new Map();
    /** 登录回调 */
    public static onLogin: (result: LoginResult) => void;
    /** 获取玩家存档回调 */
    public static onGetGameData: (result: GetGameDataResult) => void;
    /** 上传玩家存档回调 */
    public static onSaveGameData: ResultCallback;
    /** 激励视频相关回调(每次都会调用) */
    public static rewardedVideoListener: RewardedVideoListener;
    /** 初始化内购 */
    public static onInitPay: () => void;
    /** 支付相关回调 */
    public static payListener: PayListenter;

}


/** 用户信息 */
export interface UserInfo {
    /** 用户id */
    userId: string;
    /** 用户名字 */
    userName?: string;
}

/** 登录结果 */
export interface LoginResult extends ResultParam {
    userId?: string;
    userName?: string;
    extParam?: string;
}

/** 下载存档参数 */
export interface GetGameDataParams {
    /** 用户id */
    userId: string;
    /** 扩展参数 */
    extParam?: string;
}

/** 下载存档 */
export interface GetGameDataResult extends ResultParam {
    /** 存档更新时间 */
    updateTime?: number;
}

/** 上传存档参数 */
export interface SaveGameDataParams {
    /** 用户id */
    userId: string;
    /** 存档数据  */
    gameData: string;
    /** 扩展参数 */
    extParam?: string;
    /** 上传成功 */
    success?: () => void;
    /** 上传失败 */
    fail?: () => void;
}

/** 支付接口需要的参数 */
export interface PayParams {
    /** 商品ID （小额支付可能不需要商品id） */
    productId?: string;
    /** 商品价格 */
    price: number;
    /** 商品名称 */
    name?: string;
    /** 商品描述 */
    desc?: string;
    /** 是否订阅商品 */
    isSub?: boolean;
    /** 是否小额支付 */
    isMini?: boolean;
    /** 扩展参数 */
    extParam?: string;
    /** 支付结果 */
    onPayResult?: ResultCallback
}

/** 支付相关的回调 */
export interface PayListenter {
    /** 商品信息结果 */
    onGetProducts: (content: string) => void;
    /** 请求开始支付 */
    onStartPay: (args: PayParams) => void;
    /** 支付结果 */
    onPayResult: (payResult: PayResult) => void;
}

/** 支付结果 */
export interface PayResult extends ResultParam {
    /** 支付结果   0支付成功 1支付失败 2支付环境异常 3可能延迟 4支付取消 5商品未找到 6延迟到账(补单)*/
    code: number;
    /** 游戏中商品ID */
    productId: string;
}

/** 激励视频接口参数 */
export interface RewardedVideoParams {
    /** 广告位Id */
    adId?: string;
    /** 获取视频奖励成功 */
    success: (adId: string) => void;
    /** 获取视频奖励失败 */
    fail?: (adId: string) => void;
}

/** 激励视频相关回调 */
export interface RewardedVideoListener {
    /** 请求展示激励视频广告 */
    onRewardedVideoStart?: (adId: string) => void;
    /** 激励视频观看完成 */
    onRewardedVideSuccess?: (adId: string) => void;
    /** 激励视频观看失败 */
    onRewardedVideFail?: (adId: string) => void;
    /** 激励视频展示 */
    onRewardedVideShow?: (adId: string) => void;
    /** 激励视频关闭 */
    onRewardedVideClose?: (adId: string) => void;
    /** 激励视频点击 */
    onRewardedVideClick?: (adId: string) => void;
    /** 激励视频产生收益 */
    onRewardedVideRevenue?: (adId: string, revenue: number) => void;
    /** 激励视频播放出错 */
    onRewardedVideError?: (adId: string, errMsg: string) => void;
}