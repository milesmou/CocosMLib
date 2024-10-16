import { Node, find } from "cc";
import { ParseItemTool } from "../../../mlib/misc/PlayerInventory";
import { UIConstant } from "../../gen/UIConstant";
import { TUnforcedGuide } from "../../gen/table/schema";
import { GameData } from "../GameData";
import GameTable from "../GameTable";
import { PlayerData } from "../PlayerData";
import { UIGuide } from "./UIGuide";

/**
 * 非强制引导ID枚举
 */
export enum EUnforcedGuideId {
    None = 0,
    /** 引导买肉夹馍给女儿 */
    RequireEvent1 = 1001,

}

/** 新手引导触发的条件枚举 */
export enum EGuideCondition {
    /** 打开界面 */
    OpenUIPanel = 1,
    /** 战斗成功回到主界面 */
    FightSuccBackHUD = 2,
}

/**
* 引导管理
*/
export class GameGuide {

    public static get Inst() { return createSingleton(GameGuide); }
    protected onInst() {
        this._readyToGuide = false;
        app.event.on(mEventKey.OnGuideStart, () => {
            this._readyToGuide = false;
        }, this);
        app.event.on(mEventKey.OnGuideEnd, (guideId: number) => {
            if (!mGameSetting.skipGuide) {
                this.finisheGuide(guideId);
            }
        }, this);
    }

    /** 准备开始引导 但还在等待中 */
    private _readyToGuide = false;


    /** 当前是否正在进行引导 或者 准备进行引导 */
    public get isGuide(): boolean {
        return this._readyToGuide || UIGuide.Inst.isGuide;
    }

    /** 当前是否正在进行指定的引导 */
    public isInGuide(guideId: number): boolean {
        return UIGuide.Inst.nowGuide == guideId;
    }

    /** 引导是否已完成 */
    public isGuideFinished(guideId: number) {
        return GameData.Inst.guide.includes(guideId);
    }

    /** 将引导标记为已完成 */
    public finisheGuide(guideId: number) {
        if (!GameData.Inst.guide.includes(guideId)) {
            GameData.Inst.guide.push(guideId);
            GameData.Inst.delaySave();
        }
    }

    /** 结束当前引导 */
    public finisheNowGuide() {
        if (!UIGuide.Inst.nowGuide) return;
        UIGuide.Inst.forceStopGuide();
    }



    ///新手引导逻辑

    /** 
     * 触发新手引导条件
     * 检测是否需要开启新手引导
     */
    public guideCondition(condition: EGuideCondition, arg1?: string, arg2?: string, arg3?: string) {
        // return;
        let list = GameTable.Table.TbGuideOpen.getDataList();
        for (const guideOpen of list) {
            if (this.isGuideFinished(guideOpen.ID)) continue;
            if (guideOpen.GuideCondition == condition) {
                //检查参数
                if (guideOpen.Args1 && guideOpen.Args1 != arg1) continue;
                if (guideOpen.Args2 && guideOpen.Args2 != arg2) continue;
                if (guideOpen.Args3 && guideOpen.Args3 != arg3) continue;
                //检测背包物品
                if (guideOpen.ItemRequire && !PlayerData.Inst.isCostEnough(guideOpen.ItemRequire)) {
                    if (guideOpen.GiveItem) {
                        mLogger.warn(`补充引导需求的物品 ID=${guideOpen.ID}`);
                        let requires = ParseItemTool.parseGameItem(guideOpen.ItemRequire);
                        for (let i = 0; i < requires.length; i++) {
                            const require = requires[i];
                            let ownNum = PlayerData.Inst.getItemAmount(require[0], require[1]);
                            if (ownNum < require[2]) {
                                PlayerData.Inst.getReward([require[0], require[1], require[2] - ownNum]);
                            }
                        }
                    } else {
                        mLogger.warn(`引导需求的物品不足 ID=${guideOpen.ID}`);
                        return false;
                    }
                }
                this._readyToGuide = true;
                UIGuide.Inst.startGuide(guideOpen.ID);
                if (guideOpen.EmitOnce) this.finisheGuide(guideOpen.ID);
                return true;
            }
        }

        return false;
    }


    /** 刚进游戏 检查是否出发新手引导 */
    public async checkShowGuide() {
        if (await this.checkNewUser()) return;

    }

    public async checkNewUser() {
        // let stageId = "1_1_1";
        // if (GameTool.isStageUnlock(stageId)) return false;
        // this._readyToGuide = true;
        return true;
    }

    /** 检查引导是否满足触发条件 */
    public checkGuideCondition(guideId: number) {
        if (this.isInGuide(guideId)) return false;
        if (this.isGuideFinished(guideId)) return false;
        // let data = GameTable.Table.TbGuideOpenPlan.get(guide);
        // if (data) {
        //     if (data.NeedPlayerLv) {
        //         return GameData.Inst.playerLv >= data.NeedPlayerLv;
        //     } else if (data.NeedBattleLv) {
        //         return GameData.Inst.battleState.level >= data.NeedBattleLv;
        //     } else if (data.NeedMainTask) {
        //         return GameData.Inst.myMainTaskData.taskId > data.NeedMainTask;
        //     }
        // } else {
        //     logger.error(`GuideOpenPlan表中未配置 ID=${guide}`)
        // }
        return false;
    }

    /** 展示开场漫画 */
    public async checkShowWelcomeCartoon() {

        return true;
    }



    //#region 非强制引导条件判断

    public checkUnforcedGuide(guideData: TUnforcedGuide): boolean {
        if (guideData.GuideID == EUnforcedGuideId.RequireEvent1) return this.checkGuide1001(guideData);
        return false;
    }

    public async getUnforcedGuideStepNode(guideData: TUnforcedGuide): Promise<Node> {
        let uiNode = app.ui.getUI(UIConstant[guideData.UIName]).node;
        if (guideData.GuideID == EUnforcedGuideId.RequireEvent1) {
            if (guideData.StepId == 2) {
                return find("home/Bottom/$Content", uiNode).children[0];
            } else if (guideData.StepId == 7) {
                return find("home/$ScrollView/view/content", uiNode).children[0];
            }
        }
        return null;
    }

    private checkGuide1001(guideData: TUnforcedGuide): boolean {
        if (guideData.StepId < 4) {//
            return PlayerData.Inst.getItemAmount(1, 1011) == 0;//背包没有肉夹馍
        } else {//供销社按钮
            return PlayerData.Inst.getItemAmount(1, 1011) > 0;//背包有肉夹馍
        }
        return false;
    }

    //#endregion


}