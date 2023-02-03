import { JsonAsset, TextAsset } from 'cc';
import { AssetMgr } from '../../mm/manager/AssetMgr';
import { SingletonFactory } from '../../mm/utils/SingletonFactory';
import { Tables } from '../gen/table/Types';
import { Config, GlobalVal, Guide } from "./DataEntity";

export default class DataManager {
   public static get Inst() { return SingletonFactory.getInstance<DataManager>(DataManager); }
    globalVal!: GlobalVal;
    config!: Config;

    public Tables: Tables = null!;


    private guides!: { [id: number]: Guide };

    async initData() {
        let prefix = "data/";
        let files: string[] = [];
        new Tables(file => {
            files.push(file);
            return [];
        });
        let datas: Map<string, JsonAsset> = new Map();
        for (let i = 0; i < files.length; i++) {
            let location = prefix + files[i];
            let asset = await AssetMgr.loadAsset<JsonAsset>(location, JsonAsset);
            datas.set(files[i], asset);
        }
        this.Tables = new Tables(file => {
            let obj = datas.get(file)?.json;
            AssetMgr.DecRef(prefix + file, 1);
            return obj;
        });
        console.log(this.Tables.TbCityMap.get(1));

    }


    getGuideData(guideId: number) {
        let arr: Guide[] = [];
        for (const key in this.guides) {
            let v = this.guides[key];
            if (v.GuideID == guideId) {
                arr.push(v);
            }
        }
        return arr;
    }
}
