import { Tween, tween } from "cc";
import { InventoryItemSO } from "../../misc/PlayerInventory";
import { TaskItemSO } from "../../misc/PlayerTask";
import { Utils } from "../../utils/Utils";
import { LocalStorage } from "./LocalStorage";


/** 游戏数据存档基类(存档的Key使用游戏名字) */
export abstract class GameSave {

    /** 准备延迟存档,忽略其它存档请求 */
    private _readySave = false;
    /** 自增uid */
    private _uid = 0;
    /** 存档创建日期 */
    private _createDate = 0;
    /** 上一次重置每日数据日期 */
    private _date = 0;

    /** 自增且唯一的UID */
    public get newUid() {
        this._uid++;
        this.delaySave();
        return this._uid;
    }

    /** 是否当天进来的新用户 */
    public get isNewUser() {
        return this._createDate == Utils.getDate();
    }

    /** 用户id */
    public userId: string = "";

    /** 背包数据存档 */
    public inventory: InventoryItemSO[] = [];

    /** 任务数据存档 */
    public task: TaskItemSO[] = [];

    /** 引导数据存档 */
    public guide: number[] = [];

    /** 当前进行的非强制引导ID */
    public unforcedGuide = 0;

    /** 标记存档 */
    public flag: { [key: string]: string } = {};

    /**
     * 初始化
     * @param onInit 初始化回调
     * @param onNewUser 新用户回调
     * @param onDateChange 日期变化回调
     */
    public init(onInit: () => void, onNewUser: () => void, onDateChange: (lastDate: number, today: number) => void) {
        onInit && onInit();
        if (!this._createDate) {
            this._createDate = Utils.getDate();
            onNewUser && onNewUser();
            this.delaySave();
        }
        let today = Utils.getDate();
        if (today > this._date) {
            onDateChange && onDateChange(this._date, today);
            this._date = today;
            this.delaySave();
        }
    }

    /** 立即存档 */
    public save() {
        GameSave.serialize(this);
        GameSave.updateSaveTime();
    }

    /** 延迟存档 */
    public delaySave() {
        if (!this._readySave) {
            this._readySave = true;
            tween(GameSave).delay(0.05).call(() => {
                this._readySave = false;
                this.save();
            }).start();
        }
    }

    /** 从本地缓存读取存档 */
    public deserialize<T extends GameSave>(inst: T): T {
        return GameSave.deserialize(inst);
    }

    /** 获取存档序列化后的字符串 */
    public getSerializeStr() {
        let str = GameSave.getSerializeStr(this);
        return LZString.compressToBase64(str);
    }

    /** 字典或数组集合的元素的key的后缀 */
    private static readonly collectionItemSuffix = "$item";

    /** 替换本地存档 */
    public static replaceGameData(strData: string) {
        if (!strData) {
            mLogger.warn("存档数据为空");
            return;
        }
        Tween.stopAllByTarget(GameSave);
        let decStrData: string = strData;
        if (!strData.startsWith("{")) {
            decStrData = LZString.decompressFromBase64(strData);
        }
        if (!decStrData) {
            mLogger.warn("存档解压失败!")
            return;
        }
        LocalStorage.setValue(mGameSetting.gameName, decStrData);
        GameSave.updateSaveTime();
    }

    /** 清除本地存档 */
    public static clearGameData() {
        LocalStorage.removeValue(mGameSetting.gameName);
        GameSave.updateSaveTime();
    }

    /** 获取存档时间 毫秒 */
    public static getSaveTime() {
        let key = mGameSetting.gameName + "_SaveDataTimeMS";
        return LocalStorage.getValue(key, 0);
    }

    /** 更新存档时间 */
    public static updateSaveTime() {
        let key = mGameSetting.gameName + "_SaveDataTimeMS";
        LocalStorage.setValue(key, Date.now());
    }

    /** 从本地缓存读取存档 */
    public static deserialize<T extends GameSave>(inst: T): T {
        Reflect.defineProperty(inst, "name", { enumerable: false });
        Reflect.defineProperty(inst, "_readySave", { enumerable: false });
        let name = mGameSetting.gameName;
        let jsonStr = LocalStorage.getValue(name, "");
        if (jsonStr) {
            try {
                let obj = JSON.parse(jsonStr);
                if (obj) this.mergeValue(inst, obj);
            } catch (err) {
                mLogger.error(err);
            }
        } else {
            mLogger.debug("无本地存档", name);
        }
        return inst;
    }

    /** 将数据写入到本地存档中 */
    private static serialize<T extends GameSave>(inst: T) {
        let name = mGameSetting.gameName;
        let jsonStr = this.getSerializeStr(inst);
        LocalStorage.setValue(name, jsonStr);
    }

    /** 获取存档序列化后的字符串 */
    private static getSerializeStr<T extends GameSave>(inst: T) {
        return JSON.stringify(inst, (key, value) => {
            if (key.startsWith("__")) return;
            if (key.endsWith(this.collectionItemSuffix)) return;
            return value;
        });;
    }

    /** 合并存档默认数据和本地数据 */
    private static mergeValue(target: object, source: object) {
        for (const key in target) {
            if (Reflect.has(source, key)) {
                if (key.endsWith(this.collectionItemSuffix)) continue;
                if (Array.isArray(target[key]) && Array.isArray(source[key])) {//数组
                    target[key] = source[key];
                    if (target[key + this.collectionItemSuffix]) this.checkMissProperty(target[key], target[key + this.collectionItemSuffix]);
                } else if (typeof target[key] === "object" && typeof source[key] === "object") {//对象拷贝
                    if (!target[key] || Object.keys(target[key]).length == 0) {//为空或使用空字典存储,完整赋值
                        target[key] = source[key];
                        if (target[key + this.collectionItemSuffix]) this.checkMissProperty(target[key], target[key + this.collectionItemSuffix]);
                    } else {//递归赋值
                        this.mergeValue(target[key], source[key]);
                    }
                } else {//直接完整赋值
                    target[key] = source[key];
                }
            }
        }
    }

    /** 检查数组或字典的元素是否丢失字段 */
    private static checkMissProperty<T extends object>(collect: T[] | { [key: string]: T }, itemObj: T) {
        if (collect instanceof Array) {
            for (const key in itemObj) {
                collect.forEach(v => {
                    if (v[key] === undefined) {
                        v[key] = itemObj[key];
                    }
                })
            }
        } else {
            for (const key in itemObj) {
                for (const key1 in collect) {
                    let element = collect[key1];
                    if (element[key] === undefined) {
                        element[key] = itemObj[key];
                    }
                }
            }
        }
    }
}

