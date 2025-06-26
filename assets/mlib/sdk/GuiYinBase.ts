/** 归因上报的基类 */
export class GuiYinBase {

    /** 设置归因上报的实例 */
    public static setInstance(inst: GuiYinBase) {
        //@ts-ignore
        globalThis.mGuiYin = inst;
    }

    /** 
     * 归因安装
     * adNetwork:投放广告的渠道ID,需要与发行平台匹配 attributionPlatform:监测平台
     */
    public install(data: { adNetwork?: string, attributionPlatform?: string, customProperties?: Record<string, any> }) { }

    /** 
     * 注册
     * regType:注册方式 regStatus:注册状态
     */
    public register(data?: { regType?: string, regStatus?: string, customProperties?: Record<string, any> }) { }

    /** 登录 */
    public login(data?: { uid?: string, roleName?: string, customProperties?: Record<string, any> }) { }

    /** 创建角色 */
    public createRole(data?: { uid?: string, roleName?: string, customProperties?: Record<string, any> }) { }

    /** 激励视频展示 */
    public rewardedAdShow(data?: { adId?: string, customProperties?: Record<string, any> }) { }

    /** 激励视频点击 */
    public rewardedAdClick(data?: { adId?: string, customProperties?: Record<string, any> }) { }

    /** 内购订单状态 */
    public purchaseOrder(data: { orderId: string, payAmount: number, currencyType?: string, payType?: string, status?: string, customProperties?: Record<string, any> }) { }

    /** 内购成功 */
    public purchase(data: { orderId: string, payAmount: number, currencyType?: string, payType?: string, customProperties?: Record<string, any> }) { }

    /** 收藏游戏 */
    public addToWishlist(data?: { addToWishlistType?: string, customProperties?: Record<string, any> }) { }

    /** 分享游戏 */
    public share(data?: { shareTarget?: string, customProperties?: Record<string, any> }) { }

    /** 完成新手指引 */
    public tutorialFinish(data?: { tutorialType?: string, customProperties?: Record<string, any> }) { }

    /** 游戏等级提升 */
    public updateLevel(data: { beforeUpgrade: number, afterUpgrade: number, customProperties?: Record<string, any> }) { }

    /** 浏览游戏内容 */
    public viewContent(data: { content?: number, customProperties?: Record<string, any> }) { }

}

GuiYinBase.setInstance(new GuiYinBase());

declare global {
    /** 归因上报实例 */
    const mGuiYin: GuiYinBase;
}