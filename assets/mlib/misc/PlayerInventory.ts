import { tween } from "cc";
import { LocalStroage } from "../manager/StroageMgr";

/** 背包物品的基本信息 */
export class InventoryItemSO {

    /** 物品唯一识别id */
    public uid: number;

    /** 物品的大类型 */
    public type: number;

    /** 物品id */
    public id: number;

    /** 物品数量 */
    public amount: number;


    /** 物品被谁持有 */
    public holder: number;
}

export class PlayerInventory {
    private _localStroage: LocalStroage;

    private _itemCache: { [key: string]: InventoryItemSO } = {};

    private _onInventoryChange: () => void;

    private _mergeInventoryItem: boolean;

    /** 初始化玩家背包 */
    protected init(localStroage: LocalStroage, onInventoryChange?: () => void, mergeInventoryItem = false) {
        this._localStroage = localStroage;
        this._onInventoryChange = onInventoryChange;
        this._mergeInventoryItem = mergeInventoryItem;
    }


    /** 获取奖励，添加到背包 */
    public getReward(reawrds: string | string[] | number[][], multiple = 1, showTips = true, showTipsNow = true, args?: { [key: string]: any }) {
        if (reawrds.length == 0) return
        let items: number[][];
        if (Array.isArray(reawrds) && Array.isArray(reawrds[0])) items = reawrds as any;
        else items = ParseItemTool.parseGameItem(reawrds as any);
        items = this.postParseRewards(items);
        if (items.length > 0) {
            for (const item of items) {
                this.addGameItem(item[0], item[1], item[2] * multiple);
                this.onGetRewardItem(item[0], item[1], item[2] * multiple, showTips, showTipsNow, args);
            }
            this.saveInventory();
        }
    }

    /**可重写 解析配置的奖励 部分奖励需要特殊处理(如掉落池之类) */
    protected postParseRewards(reawrds: number[][]) {
        return reawrds;
    }

    /**可重写 重写该方法处理获取奖励的提示信息 */
    protected onGetRewardItem(type: number, itemId: number, itemNum: number, showTips = true, showTipsNow = true, args?: { [key: string]: any }) {

    }


    /** 消耗背包中的物品 */
    public delCost(costs: string | string[] | number[][], multiple = 1, showTips = true, showTipsNow = true, args?: { [key: string]: any }) {
        if (costs.length == 0) return;
        let items: number[][];
        if (Array.isArray(costs) && Array.isArray(costs[0])) items = costs as any;
        else items = ParseItemTool.parseGameItem(costs as any);
        for (const item of items) {
            let type = item[0];
            let id = item[1];
            let num = item[2];
            this.onDelCostItem(type, id, num, showTips, showTipsNow, args);
            let itemSO = this.getCacheItemSO(type, id);
            if (itemSO) {
                this.delGameItem(itemSO, num);
            }
            else {
                var inventoryItemSos = this._localStroage.inventory.filter(v => v.type == type && v.id == id);
                for (const itemSo of inventoryItemSos) {
                    if (num > 0) {
                        if (num >= itemSo.amount) {
                            this.delGameItem(itemSo, itemSo.amount);
                            num -= itemSo.amount;
                        }
                        else {
                            this.delGameItem(itemSo, num);
                            num = 0;
                        }
                    }
                }
            }
        }
        this.saveInventory();
    }


    /**可重写 重写该方法处理获消耗物品的提示信息 */
    protected onDelCostItem(type: number, itemId: number, itemNum: number, showTips = true, showTipsNow = true, args?: { [key: string]: any }) {
    }

    /** 背包物品是否足够 */
    public isCostEnough(costs: string | string[] | number[][], multiple = 1, args?: { [key: string]: any }) {
        if (costs.length == 0) return true;
        let cost: number[][];
        if (Array.isArray(costs) && Array.isArray(costs[0])) cost = costs as any;
        else cost = ParseItemTool.parseGameItem(costs as any);
        for (let i = 0; i < cost.length; i++) {
            var arr = cost[i];
            if (arr.length == 3) {
                if (!this.onSingleCostEnough(arr[0], arr[1], arr[2], multiple, args)) return false;
            }
        }
        return true;
    }

    /**可重写 检查单个物品数量是否足够 */
    protected onSingleCostEnough(type: number, itemId: number, needNum: number, multiple = 1, args?: { [key: string]: any }) {
        var ownNum = this.getItemAmount(type, itemId);
        if (ownNum < needNum * multiple) return false;
        return true;
    }

    /** 获取背包物品数量 */
    public getItemAmount(type: number, itemId: number) {
        let itemSo = this.getCacheItemSO(type, itemId);
        if (itemSo) return itemSo.amount;
        var inventoryItemSos = this._localStroage.inventory.filter(v => v.type == type && v.id == itemId);
        if (inventoryItemSos.length == 0) return 0;
        else {
            let num = 0;
            for (const itemInfo of inventoryItemSos) {
                num += itemInfo.amount;
            }

            return num;
        }
    }

    /** 添加物品到背包中 */
    public addGameItem(type: number, itemId: number, itemNum: number) {
        let stackLimit = this.getItemStackLimit(type, itemId);
        //无堆叠上限
        if (stackLimit <= 0) {
            let key = type + "_" + itemId;
            let inventoryItemSo: InventoryItemSO = this.getCacheItemSO(type, itemId);
            if (!inventoryItemSo) {
                inventoryItemSo = this.genInventoryItemSO(type, itemId);
                this._itemCache[key] = inventoryItemSo;
                this._localStroage.inventory.push(inventoryItemSo);
            }

            inventoryItemSo.amount += itemNum;
        }
        else {
            let remain = itemNum;
            //补充背包未堆叠满的物品
            var inventoryItemSos = this._localStroage.inventory.filter(v => v.type == type && v.id == itemId && v.amount < stackLimit);
            for (const itemSo of inventoryItemSos) {
                if (itemSo.amount + remain <= stackLimit) {
                    itemSo.amount += remain;
                    remain = 0;
                    break;
                }
                else {
                    let dt = stackLimit - itemSo.amount;
                    itemSo.amount = stackLimit;
                    remain -= dt;
                }
            }

            //生成新的背包物品
            if (remain > 0) {
                var num1 = Math.floor(remain / stackLimit);
                for (let i = 0; i < num1; i++) {
                    var inventoryItemSo = this.genInventoryItemSO(type, itemId);
                    inventoryItemSo.amount = stackLimit;
                }

                var num2 = remain % stackLimit;
                if (num2 > 0) {
                    var inventoryItemSo = this.genInventoryItemSO(type, itemId);
                    inventoryItemSo.amount = num2;
                }
            }
        }

        this.saveInventory();
    }

    /** 从获取缓存的物品对象 */
    private getCacheItemSO(type: number, itemId: number) {
        let stackLimit = this.getItemStackLimit(type, itemId);
        if (stackLimit > 0) return null;
        let key = type + "_" + itemId;
        let inventoryItemSo = this._itemCache[key];
        if (inventoryItemSo) return inventoryItemSo;
        else {
            inventoryItemSo = this._localStroage.inventory.find(v => v.type == type && v.id == itemId);
            if (inventoryItemSo) this._itemCache[key] = inventoryItemSo;
        }
        return inventoryItemSo;
    }

    /**可重写 生成用于缓存的物品对象 */
    protected genInventoryItemSO(type: number, itemId: number): InventoryItemSO {
        var inventoryItemSo = new InventoryItemSO();
        inventoryItemSo.uid = this._localStroage.newUid;
        inventoryItemSo.type = type;
        inventoryItemSo.id = itemId;
        inventoryItemSo.amount = 0;
        return inventoryItemSo;
    }

    /**可重写 物品堆叠上限 0表示无限制 */
    protected getItemStackLimit(type: number, itemId: number) {
        return 0;
    }

    /** 从背包中删除指定物品和数量 */
    public delGameItem(itemSo: InventoryItemSO, num: number) {
        if (itemSo && num > 0) {
            itemSo.amount -= num;
            if (itemSo.amount <= 0) {
                delete this._itemCache[itemSo.type + "_" + itemSo.id];
                let index = this._localStroage.inventory.indexOf(itemSo);
                if (index > -1) this._localStroage.inventory.splice(index, 1);
            }
        }

        this.saveInventory();
    }

    /** 合并背包中的物品堆叠 */
    private mergeInventoryItem() {
        let map: { [key: string]: InventoryItemSO[] } = {};
        let mapAmount: { [key: string]: number } = {};
        let mapLimit: { [key: string]: number } = {};
        for (const itemSo of this._localStroage.inventory) {
            let limit = this.getItemStackLimit(itemSo.type, itemSo.id);
            if (limit <= 0) continue;
            if (itemSo.amount >= limit) continue;
            let key = itemSo.type + "_" + itemSo.id;
            let list = map[key] || [];
            list.push(itemSo);
            let amount = mapAmount[key] || 0;
            mapAmount[key] = amount + itemSo.amount;
            mapLimit[key] = limit;
        }
        for (const key in map) {
            let list = map[key];
            let amount = mapAmount[key];
            let limit = mapLimit[key];
            let num1 = amount / limit;
            let num2 = amount % limit;
            for (var i = 0; i < list.length; i++) {
                var itemSo = list[i];
                if (i < num1) itemSo.amount = limit;
                else if (num2 > 0 && i == num1) itemSo.amount = num2;
                else {
                    let index = this._localStroage.inventory.indexOf(itemSo);
                    if (index > -1) this._localStroage.inventory.splice(index, 1);
                }
            }
        }
    }


    private readyMerge = false;

    /** 保存背包物品到本地 */
    private saveInventory() {
        if (this._mergeInventoryItem && !this.readyMerge) {
            this.readyMerge = true;
            tween({}).delay(0.01).call(() => {
                this.readyMerge = false;
                this.mergeInventoryItem();
            }).start();
        }
        this._localStroage.delaySave();
        this._onInventoryChange && this._onInventoryChange();
    }

}

export class ParseItemTool {
    static parseGameItem(strs: string | string[]) {
        let map: { [key: string]: number } = {};
        let array: string[];
        if (Array.isArray(strs)) array = strs;
        else array = strs.trim().split(";").filter(v => v != "");
        for (let i = 0; i < array.length; i++) {
            const v = array[i];
            if (v.indexOf(";") > -1) {
                let arr1 = this.parseGameItem(v.split(";"));
                for (let j = 0; j < arr1.length; j++) {
                    const arr2 = arr1[j];
                    let key = arr2[0] + "_" + arr2[1];
                    let count = map[key] || 0;
                    map[key] = count + arr2[2];
                }
            } else {
                let arr = this.parseSingleGameItem(v);
                let key = arr[0] + "_" + arr[1];
                let count = map[key] || 0;
                map[key] = count + arr[2];
            }
        }
        let result: number[][] = [];

        for (const key in map) {
            let strings = key.split('_');
            let type = parseFloat(strings[0]);
            let id = parseFloat(strings[1]);
            result.push([type, id, map[key]]);
        }
        return result;
    }

    static parseSingleGameItem(str: string) {
        let result = [1, 0, 0];
        let arr = str.trim().split(",").filter(v => v != "");
        if (arr.length >= 2) {
            let start = 0;
            if (arr.length == 2) start = 1;
            for (let i = start; i < 3; i++) {
                let v = parseFloat(arr[i]);
                if (!isNaN(v)) result[i] = v;
                else console.error("请检查物品配置:", str);
            }
        } else {
            console.error("请检查物品配置:", str);
        }
        return result;
    }
}