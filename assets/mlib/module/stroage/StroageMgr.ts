import { sys, tween } from "cc";
import { InventoryItemSO } from "../../misc/PlayerInventory";
import { TaskItemSO } from "../../misc/PlayerTask";
import { Utils } from "../../utils/Utils";
import { LZString } from "../../third/lzstring/LZString";
import { MLogger } from "../logger/MLogger";


export abstract class LocalStroage {

    public abstract name: string;
    /** 存档描述(多存档时使用) */
    public desc = "";
    /** 存档时间最后一次保存时间(时间戳) */
    public time = 0;
    /** 准备延迟存档,忽略其它存档请求 */
    private _readySave = false;
    /** 自增uid */
    private _uid = 0;
    /** 存档创建日期 */
    private _createDate = 0;
    /** 上一次重置每日数据日期 */
    private _date = 0;

    /** 自增且唯一的UID */
    get newUid() {
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

    /** 标记存档 */
    public flag: { [key: string]: string } = {};

    /**
     * 初始化
     * @param onInit 初始化回调
     * @param onNewUser 新用户回调
     * @param onDateChange 日期变化回调
     */
    init(onInit: () => void, onNewUser: () => void, onDateChange: (lastDate: number, today: number) => void) {
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
    save() {
        this.time = Date.now();
        StroageMgr.serialize(this);
    }
    /** 延迟存档 */
    delaySave() {
        if (!this._readySave) {
            this._readySave = true;
            tween({}).delay(0.01).call(() => {
                this._readySave = false;
                this.save();
            }).start();
        }
    }


    /** 获取存档序列化后的字符串 compress默认true */
    getSerializeStr(compress = true) {
        this.time = Date.now();
        let str = JSON.stringify(this);
        return compress ? LZString.compressToUTF16(str) : str;
    }

    /** 替换本地存档 */
    replaceGameData(strData: string, isCompress = true) {
        if (strData && isCompress) strData = LZString.decompressFromUTF16(strData);
        StroageMgr.setValue(this.name, strData);
    }

    /** 从本地缓存读取存档 (替换存档不需要传参数)*/
    public static deserialize<T extends LocalStroage>(inst: T): T {
        return StroageMgr.deserialize(inst);
    }
}

/**
 * 本地存储工具类 (以__开头的字段不会被存档)
 */
export class StroageMgr {

    //用户自定义语言存档的Key
    public static readonly UserLanguageCodeKey = "UserLanguageCodeKey";
    /** 字典或数组集合的元素的key的后缀 */
    public static readonly CollectionItemSuffix = "$item";

    /** 从本地缓存读取存档 */
    public static deserialize<T extends LocalStroage>(inst: T): T {
        Reflect.defineProperty(inst, "name", { enumerable: false });
        Reflect.defineProperty(inst, "_readySave", { enumerable: false });
        let name = inst.name;
        let jsonStr = this.getValue(name, "");
        if (jsonStr) {
            try {
                let obj = JSON.parse(jsonStr) || {};
                this.mergeValue(inst, obj);
            } catch (err) {
                MLogger.error(err);
            }
        }
        return inst;
    }

    /** 将数据写入到本地存档中 */
    public static serialize<T extends LocalStroage>(inst: T) {
        let name = inst.name;
        let jsonStr = JSON.stringify(inst, function (key, value) {
            if (key.startsWith("__")) return;
            if (key.endsWith(StroageMgr.CollectionItemSuffix)) return;
            return value;
        });
        this.setValue(name, jsonStr);
    }

    /** 合并存档默认数据和本地数据 */
    private static mergeValue(target: object, source: object) {
        for (const key in target) {
            if (Reflect.has(source, key)) {
                if (key.endsWith(this.CollectionItemSuffix)) continue;
                if (Object.prototype.toString.call(target[key]) === "[object Object]" && Object.prototype.toString.call(source[key]) === "[object Object]") {//对象拷贝
                    if (JSON.stringify(target[key]) === "{}") {//使用空字典存储,完整赋值
                        target[key] = source[key];
                        if (target[key + this.CollectionItemSuffix]) this.checkMissProperty(target[key], target[key + this.CollectionItemSuffix]);
                    } else {//递归赋值
                        this.mergeValue(target[key], source[key]);
                    }
                } else if (Object.prototype.toString.call(target[key]) === "[object Array]" && Object.prototype.toString.call(source[key]) === "[object Array]") {//数组{
                    target[key] = source[key];
                    if (target[key + this.CollectionItemSuffix]) this.checkMissProperty(target[key], target[key + this.CollectionItemSuffix]);
                }
                else {//直接完整赋值
                    target[key] = source[key];
                }
            }
        }
    }

    //检查数组或字典的元素是否丢失字段
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

    /**
     * 从本地存储中获取缓存的值
     * @param stroageKey StroageKey键枚举
     * @param defaultV 默认值
     */
    public static getValue<T>(stroageKey: string, defaultV: T): T {
        let value: any = sys.localStorage.getItem(stroageKey);
        if (!value) return defaultV;
        if (typeof defaultV === "number") {
            let v = parseFloat(value);
            if (isNaN(v)) {
                MLogger.error(stroageKey, ": 转化为数字类型错误 ", value);
                value = defaultV;
            } else {
                value = v;
            }
        } else if (typeof defaultV === "string") {
            return value;
        } else if (typeof defaultV === "boolean") {
            return (value === "true") as any;
        } else {
            try {
                value = JSON.parse(value);
            } catch (err) {
                MLogger.error(stroageKey, ": 转化对象类型错误 ", value);
                value = defaultV;
            }
        }
        return value;
    }

    /**
     * 设置本地存储值
     */
    public static setValue(stroageKey: string, value: any) {
        if (typeof value === "object") {
            value = JSON.stringify(value);
        }
        sys.localStorage.setItem(stroageKey, String(value));
    }
}
