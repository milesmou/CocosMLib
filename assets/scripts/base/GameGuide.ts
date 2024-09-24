import { Node, find } from "cc";
import { UIConstant } from "../gen/UIConstant";
import { TUnforcedGuide } from "../gen/table/schema";
import { GameData } from "./GameData";
import { PlayerData } from "./PlayerData";
import { UIGuide } from "./guide/UIGuide";

/** 引导ID枚举 */
export enum EGuideId {

}

/**
 * 非强制引导ID枚举
 */
export enum EUnforcedGuideId {
    None = 0,
    /** 引导买肉夹馍给女儿 */
    RequireEvent1 = 1001,

}

/** 新手引导触发的条枚举 */
export enum EGuideConditionType {
    OpenUIPanel = 1,
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
            this.finisheGuide(guideId);
        }, this);
    }

    /** 准备开始引导 但还在等待中 */
    private _readyToGuide = false;


    /** 当前是否正在进行引导 或者 准备进行引导 */
    public get isGuide(): boolean {
        return this._readyToGuide || UIGuide.Inst.isGuide;
    }

    /** 当前是否正在进行指定的引导 */
    public isInGuide(guideType: EGuideId): boolean {
        return UIGuide.Inst.nowGuide == guideType;
    }

    /** 引导是否已完成 */
    public isGuideFinished(guideType: EGuideId) {
        return GameData.Inst.guide.includes(guideType);
    }

    /** 将引导标记为已完成 */
    private finisheGuide(guideType: EGuideId) {
        if (!GameData.Inst.guide.includes(guideType)) {
            GameData.Inst.guide.push(guideType);
            GameData.Inst.delaySave();
        }
    }



    ///新手引导逻辑

    /** 
     * 触发新手引导条件
     * 检测是否需要开启新手引导
     */
    public guideCondition(condition: EGuideId, arg1?: any, arg2?: any, arg3?: any) {


    }


    /** 刚进游戏 检查是否出发新手引导 */
    public async checkShowGuide() {
        if (await this.checkNewUser()) return;

    }

    public async checkNewUser() {
        let stageId = "1_1_1";
        this._readyToGuide = true;
        return false;
    }

    /** 检查引导是否满足触发条件 */
    public checkGuideCondition(guide: EGuideId) {
        if (this.isInGuide(guide)) return false;
        if (this.isGuideFinished(guide)) return false;
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