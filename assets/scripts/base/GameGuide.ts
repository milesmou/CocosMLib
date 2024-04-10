import { Node } from "cc";
import { App } from "../../mlib/App";
import { TUnforcedGuide } from "../gen/table/Types";
import { GameData } from "./GameData";
import { EGuideType, EventKey } from "./GameEnum";
import { UIGuide } from "./guide/UIGuide";

/**
* 引导管理类
*/
export class GameGuide {

    public static get Inst() { return App.getSingleInst(GameGuide); }
    private onInst() {
        this._readyToGuide = false;
        App.event.on(EventKey.OnGuideStart, () => {
            this._readyToGuide = false;
        }, this);
        App.event.on(EventKey.OnGuideEnd, (guideId: number) => {
            this.finisheGuide(guideId);
        }, this);
        App.event.on(EventKey.ShowGuide, this.showGuide, this);
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
            return UIGuide.Inst.stepIndex;
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
        //     MLogger.error(`GuideOpenPlan表中未配置 ID=${guide}`)
        // }
        return false;
    }

    /** 展示开场漫画 */
    public async checkShowWelcomeCartoon() {

        return true;
    }



    //#region 非强制引导条件判断

    public checkUnforcedGuide(guideId: number, stepIndex: number): boolean {
        return false;
    }

    public async getUnforcedGuideStepNode(guideData: TUnforcedGuide): Promise<Node> {
        return null;
    }

    //#endregion


}