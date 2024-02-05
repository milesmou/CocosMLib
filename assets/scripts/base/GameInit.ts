import { App } from "../../mlib/App";
import { AssetMgr } from "../../mlib/module/asset/AssetMgr";
import { L10nMgr } from "../../mlib/module/l10n/L10nMgr";
import { UIMgr } from "../../mlib/module/ui/manager/UIMgr";
import { UIConstant } from "../gen/UIConstant";
import { GameDataPost } from "./GameDataPost";
import { GameRedDot } from "./GameRedDot";
import GameTable from "./GameTable";
import { ShopUtil } from "./iap/ShopUtil";

/** 初始化游戏内容 */
export class GameInit {

    /** 加载资源前的初始化 */
    public static async initBeforeLoadRes() {
        //加载资源包
        await AssetMgr.loadAllBundle();
        //加载数据表
        await GameTable.Inst.initData();
        //加载提示信息预制件
        await UIMgr.Inst.showResident(UIConstant.UITipMsg);
    }


    /** 进入主界面前的初始化 */
    public static async initBeforeEnterHUD() {
        GameDataPost.Inst.initGameData();
        GameRedDot.Inst.init();
        await L10nMgr.init();
        await UIMgr.Inst.showResident(UIConstant.UIGuide);
        ShopUtil.init();
        App.chan.initIAP();
    }
}