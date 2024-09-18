import { BufferAsset } from 'cc';
import { AssetMgr } from '../../mlib/module/asset/AssetMgr';
import ByteBuf from '../gen/bright/serialization/ByteBuf';
import { Tables, TGuide, TUnforcedGuide } from '../gen/table/schema';

/**
* 数据表管理类
*/
export default class GameTable {
    public static get Inst() { return createSingleton(GameTable); }

    public static Table: Tables = null;

    public static get GlobalVar() { return this.Table.TbGlobalVar; }

    /** 加载所有数据表 */
    public static async initData(onProgress?: (finished: number, total: number) => void) {
        // //JSON
        // let assets = await AssetMgr.loadDir(dir, JsonAsset, onProgress);
        // let datas: Map<string, JsonAsset> = new Map();
        // for (let asset of assets) {
        //     datas.set(asset.name, asset);
        // }
        // GameTable.Table = new Tables(file => {
        //     let obj = datas.get(file)?.json;
        //     return obj;
        // });
        //Bin
        let dir = "table";
        let assets = await AssetMgr.loadDir(dir, BufferAsset, onProgress);
        let datas: Map<string, Uint8Array> = new Map();
        for (let asset of assets) {
            datas.set(asset.name, new Uint8Array(asset.buffer().slice(0, asset.buffer().byteLength)));
        }
        GameTable.Table = new Tables(file => {
            return new ByteBuf(datas.get(file));
        });
        AssetMgr.decDirRef(dir);
    }


    private _guideGroup: Map<number, TGuide[]>;
    public get guideGroup() { return this._guideGroup || (this._guideGroup = GameTable.Table.TbGuide.getDataList().groupBy(v => v.GuideID,)); }

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
