import Language from "../../mm/component/Language";
import { SingletonFactory } from "../../mm/utils/SingletonFactory";
import {  Config, Guide, GameConfig, GameGuide } from "./DataEntity";


export class DataManager {
    public static get Inst() { return SingletonFactory.getInstance<DataManager>(DataManager) };

    /** 远程配置 */
    public config: Config;
    /** 本地配置 */
    public get GlobalVal() { return /* this.Data.GlobalVal[1] */; };

    public Data: GameGuide & GameConfig;

    /** 初始化数据表 */
    public initData(data: cc.JsonAsset[]) {
        this.Data = {} as any;
        for (const jsonAsset of data) {
            let obj = jsonAsset.json;
            if (jsonAsset.name.startsWith("Language")) {
                Language.init(obj);
            } else {
                for (const k in obj) {
                    this.Data[k] = obj[k];
                }
            }
        }
    }

    private _guideDict: { [guideId: number]: Guide[] };
    /** 引导ID:引导步骤数组 */
    public get GuideDict() {
        if (!this._guideDict) {
            this._guideDict = {};
            for (const key in this.Data.Guide) {
                const element = this.Data.Guide[key];
                if (!this._guideDict[element.GuideID]) {
                    this._guideDict[element.GuideID] = [];
                }
                this._guideDict[element.GuideID].push(element);
            }
        }
        return this._guideDict;
    };

}
