import { BufferAsset, JsonAsset } from 'cc';
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
    public static async initData(progress?: Progress) {
        let dir = "table";
        await this.loadJsonData(dir, progress);//JSON
        // await this.loadBinData(dir, progress);//BIN
        AssetMgr.decDirRef(dir);
    }

    private static async loadJsonData(dir: string, progress?: Progress) {
        let assets = await AssetMgr.loadDir(dir, JsonAsset, progress);
        let datas: Map<string, JsonAsset> = new Map();
        for (let asset of assets) {
            datas.set(asset.name, asset);
        }
        GameTable.Table = new Tables(file => {
            let obj = datas.get(file)?.json;
            return obj;
        });
    }

    private static async loadBinData(dir: string, progress?: Progress) {
        let assets = await AssetMgr.loadDir(dir, BufferAsset, progress);
        let datas: Map<string, Uint8Array> = new Map(); progress
        for (let asset of assets) {
            datas.set(asset.name, new Uint8Array(asset.buffer().slice(0, asset.buffer().byteLength)));
        }
        GameTable.Table = new Tables(file => {
            return new ByteBuf(datas.get(file));
        });
    }

    private _guideGroup: Map<number, TGuide[]>;
    public get guideGroup() { return this._guideGroup || (this._guideGroup = GameTable.Table.TbGuide.getDataList().groupBy<number>(v => v.GuideID,)); }

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
