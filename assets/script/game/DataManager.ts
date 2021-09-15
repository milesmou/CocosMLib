import Language from "../../mm/component/Language";
import { GlobalVal, Config, Guide } from "./DataEntity";


export default class DataManager {
    private static inst: DataManager = null;
    public static get Inst() { return this.inst || (this.inst = new this()) }
    private constructor() { }

    globalVal: GlobalVal;
    config: Config;

    public Data: Guide & GlobalVal;

    private guides: { [id: number]: Guide };

    initData(data: cc.JsonAsset[]) {
        this.Data = {} as any;
        for (const jsonAsset of data) {
            let obj = jsonAsset.json;
            if (jsonAsset.name.startsWith("Language")) {
                Language.init(obj);
            } else if (jsonAsset.name == "GameConfig") {
                this.config = obj["Config"]["1"];
            } else {
                for (const k in obj) {
                    this.Data[k] = obj[k];
                }
            }
        }
    }

    getGuideData(guideId: number) {
        let arr = [];
        for (const key in this.guides) {
            let v = this.guides[key];
            if (v.GuideID == guideId) {
                arr.push(v);
            }
        }
        return arr;
    }

}
