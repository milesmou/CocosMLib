import { JsonAsset } from 'cc';
import { AssetMgr } from '../../mlib/module/asset/AssetMgr';
import { Tables, TGuide, TUnforcedGuide } from '../gen/table/Types';

/**
* 数据表管理类
*/
export default class GameTable {
    public static get Inst() { return createSingleton(GameTable); }

    public Table: Tables = null;
    public static Table: Tables = null;

    public static async initData(onProgress?: (finished: number, total: number) => void) {
        let dir = "table";
        let assets = await AssetMgr.loadDir(dir, JsonAsset, onProgress);
        let datas: Map<string, JsonAsset> = new Map();
        for (let asset of assets) {
            datas.set(asset.name, asset);
        }
        GameTable.Table = new Tables(file => {
            let obj = datas.get(file)?.json;
            return obj;
        });
        AssetMgr.decDirRef(dir);
    }

    //引导
    public getGuideGroup(guideId: number) {
        let result: TGuide[] = [];
        let dataList = GameTable.Table.TbGuide.getDataList();
        for (const guide of dataList) {
            if (guide.GuideID == guideId) result.push(guide);
        }
        return result;
    }

    public getUnforcedGuideGroup(guideId: number) {
        let result: TUnforcedGuide[] = [];
        let dataList = GameTable.Table.TbUnforcedGuide.getDataList();
        for (const guide of dataList) {
            if (guide.GuideID == guideId) result.push(guide);
        }
        return result;
    }

}
