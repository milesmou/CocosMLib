import { App } from "../../mlib/App";
import { PlayerInventory } from "../../mlib/misc/PlayerInventory";
import { GameData } from "./GameData";

export class PlayerData extends PlayerInventory {

    public static Inst = App.getSingleInst(PlayerData, t => {
        t.init(GameData.Inst, () => {
            console.log("PlayerInventory Change");
        })
    });



}