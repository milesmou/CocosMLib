import { JsonAsset } from 'cc';
import { AssetMgr } from '../../mlib/manager/AssetMgr';
import { SingletonFactory } from '../../mlib/utils/SingletonFactory';
import { Tables } from '../gen/table/Types';

export default class DataManager {
    public static get Inst() { return SingletonFactory.getInstance<DataManager>(DataManager); }

    public Tables: Tables = null!;


    async initData() {
        let prefix = "data/";
        let files: string[] = [];
        new Tables(file => {
            files.push(file);
            return [];
        });
        let datas: Map<string, JsonAsset> = new Map();
        for (let file of files) {
            let location = prefix + file;
            let asset = await AssetMgr.loadAsset<JsonAsset>(location, JsonAsset);
            datas.set(file, asset);
        }
        this.Tables = new Tables(file => {
            let obj = datas.get(file)?.json;
            AssetMgr.DecRef(prefix + file, 1);
            return obj;
        });
        console.log(this.Tables.TbCityMap.get(1));

    }


    getGuideData(guideId: number) {
        let arr: [] = [];

        return arr;
    }
}
