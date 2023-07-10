import { JsonAsset } from 'cc';
import { AssetMgr } from '../../mlib/manager/AssetMgr';
import { SingletonFactory } from '../../mlib/utils/SingletonFactory';
import { Tables } from '../gen/table/Types';
/**
* 数据表管理类
*/
export default class GameTable {
    public static get Inst() { return SingletonFactory.getInstance<GameTable>(GameTable); }

    public Table: Tables = null!;

    async initData() {
        let prefix = "table/";
        let datas: Map<string, JsonAsset> = new Map();
        for (let file of Tables.TableNames) {
            let location = prefix + file;
            let asset = await AssetMgr.loadAsset<JsonAsset>(location, JsonAsset);
            datas.set(file, asset);
        }
        this.Table = new Tables(file => {
            let obj = datas.get(file)?.json;
            AssetMgr.DecRef(prefix + file, 1);
            return obj;
        });
        console.log(this.Table.TbGlobalVar);

    }
}
