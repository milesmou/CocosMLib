import { SerializableObject } from "../../mlib/manager/StroageMgr";
import { Config, GlobalVal } from "./DataEntity";

export class GameData extends SerializableObject {

    private static _instance: GameData = null;
    /** 游戏数据单例 必须在调用deserialize方法之后使用 */
    public static get Inst(): GameData { return this._instance; };
    name = "GameData";

    /** 初始化游戏存档数据 */
    public static deserialize(initValue: Config & GlobalVal) {
        this._instance = new GameData();

    }

    /** 唯一识别码 每次使用过后自动+1 */
    private uid: number = 1;




    /** 获取一个自增且唯一的UID */
    static getUID() {
        if (GameData.Inst) {
            let v = GameData.Inst.uid++;
            GameData.Inst.delaySave();
            return v;
        } else {
            console.error("游戏数据暂未初始化");
        }
    }

    /** 检测集合中的子对象 是否丢失了新增的属性 */
    static checkMissProperty<T extends object>(collect: T[] | { [key: string]: T }, subObjectClass: { new(): T }) {
        let obj = new subObjectClass();
        if (collect instanceof Array) {
            for (const key in obj) {
                collect.forEach(v => {
                    if (v[key] === undefined) {
                        v[key] = obj[key];
                    }
                })
            }
        } else {
            for (const key in obj) {
                for (const key1 in collect) {
                    let element = collect[key1];
                    if (element[key] === undefined) {
                        element[key] = obj[key];
                    }
                }
            }
        }
    }

    static getGameData() {
        let times = 1;
        let str = JSON.stringify(GameData.Inst, (key, value) => {
            if (times > 0) {
                if (key == "date") {
                    times--;
                    return Date.now();
                }
            }
            return value;
        })
        return str;
    }
}

