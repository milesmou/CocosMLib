import { App } from "../../mlib/App";
import { PlayerInventory } from "../../mlib/misc/PlayerInventory";
import { GameData } from "./GameData";

/**
 * 玩家数据管理类
 */
export class PlayerData extends PlayerInventory {

    public static Inst = App.getSingleInst(PlayerData, t => {
        t.init(GameData.Inst)
    });



}