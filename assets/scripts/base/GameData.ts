import { GameSave } from "../../mlib/module/stroage/GameSave";


/**
 * 游戏存档数据管理类
 * 存档中不要使用Map、Set等数据类型，反序列化时无法正确识别类型；以__开头的字段不会被存档
 * 所有的字段都应当给予默认值 object类型应当给予默认值null
 */
export class GameData extends GameSave {
    private static _inst: GameData = null;
    /** 游戏数据单例 */
    public static get Inst(): GameData {
        if (!this._inst) this._inst = this.deserialize(new GameData());
        return this._inst;
    }

    /** 清除数据 */
    public static clear() {
        this._inst = null;
    }

    /** 存档名字 为避免浏览器存档冲突 最好不同游戏不同名字 */
    public name = "GameData";

}

