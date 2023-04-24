
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

export class PlayerInventory{
    
}