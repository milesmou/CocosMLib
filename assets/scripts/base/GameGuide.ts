import { Node, find } from "cc";
import { UIConstant } from "../gen/UIConstant";
import { TUnforcedGuide } from "../gen/table/Types";
import { GameData } from "./GameData";
import { EGuideType, EUnforcedGuideType, EventKey } from "./GameEnum";
import { PlayerData } from "./PlayerData";
import { UIGuide } from "./guide/UIGuide";

/**
* 引导管理类
*/
export class GameGuide {

    public static get Inst() { return createSingleton(GameGuide); }

    protected onInst() {
        this._readyToGuide = false;
        app.event.on(EventKey.OnGuideStart, () => {
            this._readyToGuide = false;
        }, this);
        app.event.on(EventKey.OnGuideEnd, (guideId: number) => {
            this.finisheGuide(guideId);
        }, this);
        app.event.on(EventKey.ShowGuide, this.showGuide, this);
    }

    /** 准备开始引导 但还在等待中 */
    private _readyToGuide = false;


    /** 当前是否正在进行引导 或者 准备进行引导 */
    public get isGuide(): boolean {
        return this._readyToGuide || UIGuide.Inst.isGuide;
    }

    /** 当前是否正在进行指定的引导 */
    public isInGuide(guideType: EGuideType): boolean {
        return UIGuide.Inst.nowGuide == guideType;
    }

    /** 获取当前引导的步骤索引 */
    public getGuideStepIndex() {
        if (UIGuide.Inst.isGuide) {
            return UIGuide.Inst.stepKey;
        }
        return -1;
    }

    /** 引导是否已完成 */
    public isGuideFinished(guideType: EGuideType) {
        return GameData.Inst.guide.includes(guideType);
    }

    /** 将引导标记为已完成 */
    private finisheGuide(guideType: EGuideType) {
        if (!GameData.Inst.guide.includes(guideType)) {
            GameData.Inst.guide.push(guideType);
            GameData.Inst.delaySave();
        }
    }

    /** 触发新手引导 */
    private showGuide(guideType: EGuideType) {


    }

    ///新手引导逻辑

    /** 刚进游戏 检查是否出发新手引导 */
    public async checkShowGuide() {
        if (await this.checkShowWelcomeCartoon()) return;

    }

    /** 检查引导是否满足触发条件 */
    public checkGuideCondition(guide: EGuideType) {
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
        if (guideData.GuideID == EUnforcedGuideType.RequireEvent1) return this.checkGuide1001(guideData);
        return false;
    }

    public async getUnforcedGuideStepNode(guideData: TUnforcedGuide): Promise<Node> {
        let uiNode = app.ui.getUI(UIConstant[guideData.UIName]).node;
        if (guideData.GuideID == EUnforcedGuideType.RequireEvent1) {
            if (guideData.StepKey == 2) {
                return find("home/Bottom/$Content", uiNode).children[0];
            } else if (guideData.StepKey == 7) {
                return find("home/$ScrollView/view/content", uiNode).children[0];
            }
        }
        return null;
    }

    private checkGuide1001(guideData: TUnforcedGuide): boolean {
        if (guideData.StepKey < 4) {//
            return PlayerData.Inst.getItemAmount(1, 1011) == 0;//背包没有肉夹馍
        } else {//供销社按钮
            return PlayerData.Inst.getItemAmount(1, 1011) > 0;//背包有肉夹馍
        }
        return false;
    }

    //#endregion


}