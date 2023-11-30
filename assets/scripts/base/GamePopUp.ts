import { App } from "../../mlib/App";
import { UIConstant } from "../gen/UIConstant";
import { GameGuide } from "./GameGuide";

/** 管理进入主界面的自动弹窗 */
export class GamePopUp {

    public static get Inst() { return App.getSingleInst(GamePopUp); }

    private _checkList: (() => boolean)[];

    private _pause: boolean = false;

    /** 启用或禁用自动弹窗检测 */
    public set pause(val: boolean) {
        this._pause = val;
    }

    /** 初始化检查弹窗的列表 */
    private initCheckList() {
        this._checkList = [];
        //顺序是从上往下依次弹出界面
        this._checkList.push(this.checkOfflineReward.bind(this));//离线经验
    }

    /**
     * 自动弹窗检测
     * @returns 有弹窗返回true 无弹窗返回false
     */
    public checkPopUp() {
        if (this._pause) return false;
        if (GameGuide.Inst.isGuide) return false;//有引导时 不弹窗
        if (!App.ui.isTopUI(UIConstant.UIHUD)) return false;//没在主界面 不弹窗
        if (!this._checkList) this.initCheckList();
        for (const cb of this._checkList) {
            if (cb()) return true;
        }
        return false;
    }


    /**检查离线奖励，最小10分钟，最大8小时奖励（读的全局表） */
    private checkOfflineReward() {

        return true;
    }
}