import { RedDotMgr } from '../../mlib/module/ui/reddot/RedDotMgr';
import { GameTool } from '../game/GameTool';
import { HealthCtrl } from '../ui/common/HealthCtrl';
import { GameClubModel } from '../ui/gameClub/GameClubModel';
import { WxGameTool } from '../ui/gameClub/WxGameTool';
import { GuildModel } from '../ui/guild/GuildModel';
import { DailyFreeUtil, EDailyType } from '../ui/shop/DailyFreeUtil';
import { SugerModel } from '../ui/Suger/SugerModel';
import { ETaskState } from '../ui/task/TaskModel';
import { GameData } from './GameData';
import { GameTemp } from './GameTemp';
import { PlayerData } from './PlayerData';


/**
 * 红点管理类
 */
export class GameRedDot {

    public static get Inst() { return createSingleton(GameRedDot); }

    /** 红点名字:事件刷新红点的方法 */
    private _redDotUpdaterMap: Map<string, () => void> = new Map();
    /** 红点名字:是否在cd中 (避免刷新过于频繁) */
    private _updaterCdMap: Map<string, boolean> = new Map();
    /** 事件名和红点名字数组 (表示事件触发时，需要刷新对应的红点，需手动配置完所有叶子节点) */
    private _redDotEvent: [number, string][] = [
        //任务
        [mEventKey.OnTaskCanGet, "Task"],
        [mEventKey.OnTaskFinished, "Task"],
        [mEventKey.OnSugerTimeChange, "SugerItem"],
        [mEventKey.mailDataChanged, "Mail"],
        [mEventKey.notieDataChaned, "Notice"],
        [mEventKey.onAddedToMyMiniProgram, "GameCollect"],
        [mEventKey.onGetGameClubData, "GameClubTask"],
        [mEventKey.onGetGameClubData, "GameClubSign"],
        [mEventKey.onSubscribeing, "GameDing"],
        [mEventKey.onGetShopAdReward, "ShopGold"],
        [mEventKey.onGetShopAdReward, "ShopDiamond"],

        [mEventKey.OnInventoryChange, "Sidebar"],
        [mEventKey.OnInventoryChange, "AddTable"],
        [mEventKey.onGetGameClubData, "DyGameClubTask"],

        //体力
        [mEventKey.guildTiliNumChanged, "Health"],
        [mEventKey.OnInventoryChange, "Health"],
        //协会
        [mEventKey.guildRedDotChanged, "ShenQingList"],
    ];

    public init() {
        //这里只初始化所有固定红点(动态加载列表中Item数量不固定,则手动处理Item中的红点,)
        RedDotMgr.initRedDotTree([
            "Main",

            //商城（不知道为什么要叫suger）
            "Main.Suger",
            "Main.Suger.ShopDiamond",//商店广告购买钻石
            "Main.Suger.ShopGold",//商店广告购买金币
            "Main.Suger.Health",//体力，目前只有协会体力会影响
            "Main.Suger.Tap",
            "Main.Suger.Tap.SugerItem",

            //任务
            "Main.Task",

            //设置、公告、邮件
            "Main.Seting",
            "Main.Seting.Mail",
            "Main.Seting.Notice",

            // 游戏圈
            "Main.Seting.GameDing",//订阅、微小

            // 微小，游戏圈
            "Main.Seting.GameClub",
            "Main.Seting.GameClub.GameClubTask",//任务
            "Main.Seting.GameClub.GameClubSign",//签到
            "Main.GameCollect",

            //抖音专属，抖音福利
            "Main.DyFuli",
            "Main.DyFuli.Sidebar",//侧边栏奖励
            "Main.DyFuli.AddTable",//添加桌面奖励
            "Main.DyFuli.DyGameClubTask",//游戏站任务

            //协会相关
            "Main.Guild",
            "Main.Guild.ShenQingList",//侧边栏奖励

        ]);
        this.registerRedDot();
        this.registerEvent();
    }

    /**
    * 注册红点的更新方法
    * @param name 红点名字
    * @param func 获取红点值的方法
    */
    private addRedDotUpdater(name: string, func: () => number): void {
        let warpFunc = () => {
            if (this._updaterCdMap.has(name)) return;
            app.timer.scheduleOnceM(() => {
                this._updaterCdMap.delete(name);
                RedDotMgr.setRedDotValue(name, func.call(this));
            }, this, 0.25);
        }
        this._redDotUpdaterMap.set(name, warpFunc);
    }

    /** 注册所有叶子红点的刷新事件 */
    private registerEvent() {
        for (const element of this._redDotEvent) {
            let evt = element[0];
            let redDotName = element[1];
            let updater = this._redDotUpdaterMap.get(redDotName);
            if (updater) {
                app.event.on(evt, updater, this);
                updater();
            } else {
                mLogger.error(`${redDotName} 未在registerRedDot方法中注册!`)
            }
        }
    }

    /** 注册所有叶子红点更新方法 */
    private registerRedDot() {
        this.addRedDotUpdater("Task", this.getTaskRedDotValue);
        this.addRedDotUpdater("SugerItem", this.getSuderRedDotValue);
        this.addRedDotUpdater("ShopGold", this.getShopGoldRedDotValue);
        this.addRedDotUpdater("ShopDiamond", this.getShopDiamondRedDotValue);
        this.addRedDotUpdater("Mail", this.getMailRedDotValue);
        this.addRedDotUpdater("Notice", this.getNoticeRedDotValue);
        this.addRedDotUpdater("GameClubTask", this.getGameClubTaskRedDotValue);
        this.addRedDotUpdater("GameClubSign", this.getGameClubSignRedDotValue);
        this.addRedDotUpdater("GameCollect", this.getGameCollectRedDotValue);
        this.addRedDotUpdater("GameDing", this.getGameDingRedDotValue);

        this.addRedDotUpdater("Sidebar", this.getGameDySidebarRedDotValue);
        this.addRedDotUpdater("AddTable", this.getGameDyAddTableRedDotValue);
        this.addRedDotUpdater("DyGameClubTask", this.getDyGameClubTaskRedDotValue);

        this.addRedDotUpdater("Health", this.getGameHealthRedDotValue);
        this.addRedDotUpdater("ShenQingList", this.getGameShenQingListRedDotValue);
    }


    ///以下为获取红点值的具体方法

    /** 任务红点数值 */
    public getTaskRedDotValue() {
        // 功能没有开启不计算任务进度
        if (!GameTool.openCheckByOpenId(1)) return 0;
        const data = GameData.Inst.taskInfo.data || [];
        if (data.length > 0) {
            const complete = data.filter(v => { return v.state == ETaskState.CanGet; })
            if (complete.length > 0) {
                return 1;
            }
        }
        return 0;
    }

    /** 小蛋糕红点数值 */
    public getSuderRedDotValue() {
        if (SugerModel.Inst.canBuy) {
            return 1;
        }
        return 0;
    }

    /** 商店广告领取金币红点数值 */
    public getShopGoldRedDotValue() {
        if (DailyFreeUtil.haveAd(EDailyType.Gold)) {
            return 1;
        }
        return 0;
    }

    /** 商店广告领取金币红点数值 */
    public getShopDiamondRedDotValue() {
        if (DailyFreeUtil.haveAd(EDailyType.Dianmond)) {
            return 1;
        }
        return 0;
    }

    /** 邮件 */
    public getMailRedDotValue() {
        // 功能没有开启
        if (!GameTool.openCheckByOpenId(7)) return 0;
        if (!GameTemp.Inst.myMailData) return 0;
        //有未读的邮件就红，有未领的邮件就红
        for (const key in GameTemp.Inst.myMailData) {
            let _mailId = GameTemp.Inst.myMailData[key].id;
            let _rewad = GameTemp.Inst.myMailData[key].attachment;
            //有未读的
            if (!GameData.Inst.myMailData.haveRead.includes(_mailId)) {
                // mLogger.debug("我是红点，邮件有未读的");
                return 1;
            }
            //有未领的
            if (_rewad) {
                if (!GameData.Inst.myMailData.getReward.includes(_mailId)) {
                    // mLogger.debug("我是红点，邮件有未领取奖励的");
                    return 1;
                }
            }
        }
        // mLogger.debug("我是红点，邮件没红点");
        return 0;
    }

    /** 公告 */
    public getNoticeRedDotValue() {
        // 功能没有开启
        if (!GameTool.openCheckByOpenId(7)) return 0;
        if (!GameTemp.Inst.myNoticeData) return 0;
        //有奖励的公告，且未领才红
        let _mailId = GameTemp.Inst.myNoticeData.id;
        let _rewad = GameTemp.Inst.myNoticeData.attachment;
        //有未领的
        if (_rewad) {
            if (!GameData.Inst.getNoticeRewardId.includes(_mailId)) {
                // mLogger.debug("我是红点，公告有未领取奖励的");
                return 1;
            }
        }
        // mLogger.debug("我是红点，公告没红点");
        return 0;
    }


    /** 游戏圈任务红点 */
    public getGameClubTaskRedDotValue() {
        if (GameClubModel.Inst.haveTaskRed()) {
            return 1;
        }
        return 0;
    }

    /** 游戏圈签到红点 */
    public getGameClubSignRedDotValue() {
        if (GameClubModel.Inst.haveSignRed()) {
            return 1;
        }
        return 0;
    }

    /** 添加到我的小程序 */
    public getGameCollectRedDotValue() {
        if (WxGameTool.haveAddedToMyMiniProgramRed()) {
            return 1;
        } else {
            return 0;
        }
    }

    /** 游戏更新订阅 */
    public getGameDingRedDotValue() {
        if (GameClubModel.Inst.haveDingYueRed()) {
            return 1;
        }
        return 0;
    }


    /** 抖音福利，侧边栏奖励 */
    public getGameDySidebarRedDotValue() {
        if (!GameData.Inst.hasGetSideBarReward || !GameData.Inst.hasGetSideBarRewardToday) {
            return 1;
        }
        return 0;
    }


    /** 抖音福利，添加桌面奖励 */
    public getGameDyAddTableRedDotValue() {
        if (!GameData.Inst.hasGetAddTableReward) {
            return 1;
        }
        return 0;
    }

    /** 抖音游戏站任务红点 */
    public getDyGameClubTaskRedDotValue() {
        if (GameClubModel.Inst.haveDyGameClubTaskRed()) {
            return 1;
        }
        return 0;
    }

    /** 商店界面的体力红点，目前只作用协会体力储备，体力不足且有储备才红 */
    public getGameHealthRedDotValue() {
        if (GuildModel.Inst.isGuildFunOpen && GameData.Inst.guildData.haveTiliNum > 0 && PlayerData.Inst.Health < HealthCtrl.Max) {
            return 1;
        }
        return 0;
    }

    /**协会申请列表里有人，红点，只有自己是管理员或者会长会去判断 */
    public getGameShenQingListRedDotValue() {
        if (GuildModel.Inst.shenHeRed) {
            return 1;
        } else {
            return 0;
        }

    }



}