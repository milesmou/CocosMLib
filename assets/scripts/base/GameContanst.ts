/**
 * 常量定义类
 */
export class GameContanst {

    //#region 基础配置不可删除

    /** 自定义的资源包 */
    static bundles = ["dynamic", "localization"];
    /** 按钮默认音效地址 */
    static buttonAuidoLocation = "audio/Click_1";

    //#endregion

    static heroDefaultSkin = "ji";
    static heroDefaultAttrNum = 1001;

    /** spine 闲置动画名字 */
    static spineIdleAnimName = "idle";
    /** spine 工作动画名字 */
    static spineWorkAnimName = "work";
    /** 士兵从建筑出去的时间间隔 */
    static soldierBornInterval = 0.4;
    /** 被动解锁的建筑 表中升级价格的类型 */
    static cascadeUnlockBuildPriceType = 9999;

    /** 引导模式下 小鸡进入战场的点位 */
    static drillSoldierBattlePoint = "B1011";

}