import { App } from "../../mlib/App";
import { MLogger } from "../../mlib/module/logger/MLogger";
import { GameData } from "./GameData";

/** 对本地存档的初始化和后处理 */
export class GameDataPost {
    public static get Inst() { return App.getSingleInst(GameDataPost); }

    /** 初始化本地存档 */
    initGameData() {
        GameData.Inst.init(this.onInitGameData.bind(this), this.onNewUser.bind(this), this.onDateChange.bind(this));
    }

    /** 本地存档反序列化成功 */
    private onInitGameData() {

    }

    /** 新用户 */
    private onNewUser() {
        MLogger.debug("新手玩家");


    }

    /** 跨天处理 */
    private onDateChange(lastDate: number, today: number) {
        MLogger.debug("onDateChange", lastDate, today);



    }

}