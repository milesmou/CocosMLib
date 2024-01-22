import { App } from "../../mlib/App";
import { GameData } from "./GameData";
import { EGuideType, EventKey } from "./GameEnum";
import { UIGuide } from "./ui/guide/UIGuide";

/**
* 引导管理类
*/
export class GameGuide {

    public static get Inst() { return App.getSingleInst(GameGuide); }
    private onInst() {
        this._readyToGuide = false;
        App.event.on(EventKey.ShowGuide, this.showGuide, this);
        App.event.on(EventKey.OnGuideStart, () => {
            this._readyToGuide = false;
        }, this);
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

    /** 展示开场漫画 */
    public async checkShowWelcomeCartoon() {

        return true;
    }





}