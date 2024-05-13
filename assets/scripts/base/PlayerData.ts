import { PlayerInventory } from "../../mlib/misc/PlayerInventory";
import { GameData } from "./GameData";
import { EventKey, ItemId } from "./GameEnum";

/**
 * 玩家数据管理类
 */

export class PlayerData extends PlayerInventory {

    public static get Inst() { return app.getSingleInst(PlayerData); }

    private onInst() {
        this.init(GameData.Inst, () => {
            app.event.emit(EventKey.OnInventoryChange);
        });
    }

    public get Gold() {
        return this.getItemAmount(1, ItemId.Gold);
    }

    public AddGold(num: number, params?: { tag?: any; showTips?: boolean; tipText?: string; }) {
        let { tag, showTips, tipText } = params || {};
        showTips = showTips == undefined ? true : showTips;
        if (num >= 0) {
            this.getReward([[1, ItemId.Gold, num]], { tag: tag });
            return true;
        } else {
            if (this.Gold + num >= 0) {
                this.delCost([[1, ItemId.Gold, -num]]);
                return true;
            } else {
                if (showTips) {
                    app.tipMsg.showToast(tipText ? tipText : app.l10n.getStringByKey("100022"));//金币数量不足
                }
                return false;
            }
        }
    }

    public get Diamond() {
        return this.getItemAmount(1, ItemId.Diamond);
    }

    public AddDiamond(num: number, params?: { showTips?: boolean; tipText?: string; }) {
        let { showTips, tipText } = params || {};
        showTips = showTips == undefined ? true : showTips;
        if (num >= 0) {
            this.getReward([[1, ItemId.Diamond, num]]);
            return true;
        } else {
            if (this.Diamond + num >= 0) {
                this.delCost([[1, ItemId.Diamond, -num]]);
                return true;
            } else {
                if (showTips) {
                    app.tipMsg.showToast(tipText ? tipText : app.l10n.getStringByKey("100023"));//钻石数量不足
                }
                return false;
            }
        }
    }



}
