import { app } from "../../mm/App";
import { SerializableObject } from "../../mm/manager/StroageMgr";

export class GameData extends SerializableObject {

    private static _instance: GameData = null;
    /** 游戏数据单例 必须在调用deserialize方法之后使用 */
    public static get Inst(): GameData { return this._instance; };
    name = "DarkSide_Data";

    /** 初始化游戏存档数据 */
    public static deserialize() {
        this._instance = new GameData();
        this._instance = app.stroage.deserialize(this._instance);
    }


    playerAsk = { ask: [] };
    playerAvg = { avg: [] };
    playerBattle = { battle: [] };
}

export interface TestSO {

}