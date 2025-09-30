import { ItemSO } from "../../mlib/misc/PlayerInventory";
import { Utils } from "../../mlib/utils/Utils";
import { ArrayHelper } from "../ui/Helper/ArrayHelper";
import { GameData } from "./GameData";
import GameTable from "./GameTable";
import { PlayerData } from "./PlayerData";
import { EChannel } from "./publish/EChannel";

/** 对本地存档的初始化和后处理 */
export class GameDataPost {
    public static get Inst() { return createSingleton(GameDataPost); }

    /** 初始化本地存档 */
    public init() {
        GameData.init();
        GameData.Inst.init(this.onInitGameData.bind(this), this.onNewUser.bind(this), this.onDateChange.bind(this));
        this.migrationGameData();
    }

    /** 本地存档反序列化成功 */
    private onInitGameData() {

    }

    /** 新用户 */
    private onNewUser() {
        mLogger.debug("新手玩家");
        // 初始化体力
        const initHealth = GameTable.Table.TbGlobalVar.HpManage[0];
        PlayerData.Inst.AddHealth(initHealth);
        if (mGameSetting.channelId == EChannel.OutTest) {
            PlayerData.Inst.AddDiamond(500);
        }
        // // 初始化副本体力
        // PlayerData.Inst.AddDungeonHealth(initHealth);
        //厨师1级默认打点
        app.chan.reportEvent(mReportEvent.level_stay_player, { k: 1 }, "NOZQY");
        if (isZQYSDK) {
            mLogger.debug("GameSdk.BI.evtAdvDataReport 0 1");
            GameSdk.BI.evtAdvDataReport("0");
            GameSdk.BI.evtAdvDataReport("1");
        }
        mGuiYin.createRole({ uid: app.chan.user.userId });

        //记录玩家创建角色的时间，格式:20220101
        GameData.Inst.playerCreatTime = Utils.getDate();
        GameData.Inst.delaySave();
    }

    /** 跨天处理 */
    private onDateChange(lastDate: number, today: number) {
        // 每日购买的礼包
        GameData.Inst.shopHaveBuyToday = {};
        // 每天自动弹出的活动和礼包
        GameData.Inst.todayHaveAutoOpeGiftBag = [];
        // 每天的群分享奖励，今日是否领取，清空下
        GameData.Inst.todayHaveGetQunShareReward = false;
        // 抖音的特别签到奖励，今日是否领取，清空下
        GameData.Inst.todayHaveGetDYSignReward = false;
        //今日已经兑换了区域金币X次
        GameData.Inst.todayHaveChangedCityGold = 0;
        // 任务每日免费刷新
        GameData.Inst.taskInfo.free = 1;

        //判断是不是全部签到完了，需要刷新整个界面，拿到签到表的最大天数
        let totalDay = GameTable.Table.TbSign.getDataList().length;
        if (GameData.Inst.signInfo.dayNum >= totalDay) {
            GameData.Inst.signInfo.dayNum = 0;
            GameData.Inst.signInfo.signed = [];
        }
        // 处理签到存档问题
        if (GameData.Inst.signInfo.dayNum > 0) {
            GameData.Inst.signInfo.signed = [];
            let signList = GameTable.Inst.getSignGroupByAddReward();//[7,15,21,28]
            for (let i = 0; i < signList.length; i++) {
                const element = signList[i];
                if (GameData.Inst.signInfo.dayNum >= element.Key) {
                    GameData.Inst.signInfo.signed.push(element.Key);
                }
            }
        }
        // 每日免费广告领取钻石金币
        GameData.Inst.dailyFree[1] = { count: 0, nextTime: 0 };
        GameData.Inst.dailyFree[2] = { count: 0, nextTime: 0 };
        GameData.Inst.dailyFree[3] = { count: 0, nextTime: 0 };

        // 每日无限体力
        GameData.Inst.haveBuyHealth = false;

        // 签到
        GameData.Inst.signInfo.canSignNum = 1;

        //通用的活动领取次数清空
        GameData.Inst.haveGetActNumToday = {};
        // 今日分享次数
        GameData.Inst.shareNum = 0;
        // 游戏圈今日任务
        GameData.Inst.gameClubHaveGet = {};
        // 游戏圈今日签到次数（是否已经达到最大天数）
        GameData.Inst.gameClubSignStatus = false;
        const last = ArrayHelper.pop(GameTable.Inst.getGameClub(3));
        if (last) {
            const maxDay = last.SignDayNum;
            if (GameData.Inst.gameClubSignNum >= maxDay) {
                const count = GameData.Inst.gameClubHaveGetSign[last.Key] || 0;
                if (count >= 1) {// 重置游戏圈签到
                    GameData.Inst.gameClubSignNum = 0;
                    GameData.Inst.gameClubHaveGetSign = {};
                }
            }
        }

        //今日看广告复活的次数归零
        GameData.Inst.adReviveNumToday = 0;

        //套圈的各种数据恢复
        GameData.Inst.taoQuanData.freeTaoQuanNum = 0;
        GameData.Inst.taoQuanData.haveOnLineMThisTime = 0;
        GameData.Inst.taoQuanData.haveAddFreeNum = 0;
        GameData.Inst.taoQuanData.haveAdTaoQuanNum = 0;
        GameData.Inst.taoQuanData.haveGetRewardIndexArr = [];
        GameData.Inst.taoQuanData.haveGetBigRewad = false;
        //套圈奖池的方案ID，就是下标ID，如果没数据就重新回到1
        GameData.Inst.taoQuanData.rewardPoolIndexId++;
        if (!GameTable.Inst.getTaoQuanPoolGroup(GameData.Inst.taoQuanData.rewardPoolIndexId).length) {
            GameData.Inst.taoQuanData.rewardPoolIndexId = 1;
        }

        // 副本广告次数
        GameData.Inst.dungeonAdBuyHealth = 0;

        //广告获得时装卷的今日次数清零
        GameData.Inst.adDressGoldData.haveGetTimesToday = 0;

        //抖音，每日侧边栏奖励
        GameData.Inst.hasGetSideBarRewardToday = false;

        //协会相关
        GameData.Inst.guildData.sendHelpDayNum = 0;

        //1V1玩法
        GameData.Inst.oneVsData.nowLevel = 1;
        GameData.Inst.oneVsData.targetTypeArr = [];
        GameData.Inst.oneVsData.haveGetBoxIndex = [];
        GameData.Inst.oneVsData.nowAddMatchIndex = 1;

        //存档
        GameData.Inst.delaySave();

        //是否进行跨周，判断今日是否为周一
        let _weekNum = new Date().getDay();
        if (_weekNum == 1) {
            this.onWeekChange();
        }

    }

    /**跨周处理 */
    private onWeekChange() {
        //商店的每周购买数据，每周清空
        GameData.Inst.shopHaveBuyWeek = {};

        //通用的活动领取次数清空
        GameData.Inst.haveGetActNumWeek = {};

        //协会相关
        GameData.Inst.guildData.helpOtherWeekNum = 0;

        GameData.Inst.delaySave();
    }


    /** 迁移旧的存档 */
    private migrationGameData() {
        GameData.Inst.inventory = this.migrationInventory(GameData.Inst.inventory);
    }


    /** 迁移旧的背包存储格式到新的 */
    private migrationInventory(list: { uid: number, type: number, id: number, amount: number }[] | ItemSO[]): ItemSO[] {
        let result: ItemSO[] = [];
        if (Array.isArray(list) && list.length > 0) {
            if (Array.isArray(list[0])) {
                result = list as ItemSO[];
            } else {
                for (const element of list as any[]) {
                    if (element.uid && element.id) {
                        result.push([element.uid, element.type, element.id, element.amount]);
                    }
                }
            }
        }
        return result;
    }
}