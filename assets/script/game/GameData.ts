import { app } from "../../mlib/App";
import { LocalStroage } from "../../mlib/manager/StroageMgr";

export default class GameData extends LocalStroage {

    private static _instance: GameData = null;
    /** 游戏数据单例 必须在调用deserialize方法之后使用 */
    public static get Inst(): GameData {
        if (this._instance == null) {
            this.deserialize();
        }
        return this._instance;
    };
    name = "GameData";

    /** 初始化游戏存档数据 */
    private static deserialize() {
        this._instance = new GameData();
        //反序列化本地数据
        this._instance = app.stroage.deserialize(this._instance);
    }

    setInitialData(): void {
        throw new Error("Method not implemented.");
    }
    resetDailyData(): void {
        throw new Error("Method not implemented.");
    }



}

