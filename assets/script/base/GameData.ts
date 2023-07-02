import { LocalStroage } from "../../mlib/manager/StroageMgr";

/**
 * 游戏存档数据管理类
 */
export class GameData extends LocalStroage {
    private static _instance: GameData = null;
    /** 游戏数据单例 必须在调用deserialize方法之后使用 */
    public static get Inst(): GameData {
        if (this._instance == null) {
            this._instance = LocalStroage.deserialize(new this());
        }
        return this._instance;
    };

    name = "GameData";

    setInitialData(): void {
        console.log("新手玩家");

    }

    onDateChange(lastDate: number, today: number): void {
        console.log("onDateChange", lastDate, today);

    }

}

