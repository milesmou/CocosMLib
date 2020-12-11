import { GameData, GlobalVal,  Config, Guide } from "./DataEntity";


export default class DataManager {
    private static inst: DataManager = null;
    public static get Inst() { return this.inst || (this.inst = new this()) }
    private constructor() { }

    globalVal: GlobalVal;
    config: Config;
  
    private guides: { [id: number]: Guide };


    initData(data: GameData) {
        this.guides = data.Guide;
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
