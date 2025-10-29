import { Tween, tween } from "cc";
import { ItemSO } from "../../misc/PlayerInventory";
import { TaskItemSO } from "../../misc/PlayerTask";


/** 准备延迟存档,忽略其它存档请求 */
let readySave = false;
/** 字典或数组集合的元素的key的后缀 */
const collectionItemSuffix = "$item";
/** 存档更新时间戳 */
function saveDataTimeMSKey() { return mGameSetting.gameName + "_SaveDataTimeMS"; }
/** 当前登录的用户Id */
function userIdKey() { return mGameSetting.gameName + "_UserId"; }

/** 
 * 游戏数据存档基类(存档的Key使用游戏名字)
 * 存档中不要使用Map、Set等数据类型，反序列化时无法正确识别类型；以__开头的字段不会被存档
 * 所有的字段都应当给予默认值 object类型应当给予默认值null
 */
export abstract class GameSave {
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
        return this._createDate == mTime.date.getYMD();
    }

    /** 背包数据存档 */
    public inventory: ItemSO[] = [];

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
            this._createDate = mTime.date.getYMD();
            onNewUser && onNewUser();
            this.delaySave();
        }
        let today = mTime.date.getYMD();
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
        if (!readySave) {
            readySave = true;
            tween(GameSave).delay(0.1).call(() => {
                readySave = false;
                this.save();
            }).start();
        }
    }

    /** 从本地缓存读取存档 */
    public deserialize<T extends GameSave>(inst: T): T {
        return GameSave.deserialize(inst);
    }

    /** 获取压缩后的存档字符串 */
    public getSerializeStr() {
        let str = GameSave.getSerializeStr(this);
        return LZString.compressToBase64(str);
    }

    /** 用户登录，若切换用户则清除本地存档 */
    public static login(userId: string) {
        let lastUserId = app.stroage.getValue(userIdKey(), "");
        if (lastUserId && userId != lastUserId) {
            mLogger.info("切换用户，清除本地存档。", lastUserId, userId);
            app.stroage.clear();
        }
        app.stroage.setValue(userIdKey(), userId);
    }

    /** 本地是否有存档数据 */
    public static haveGameData() {
        let strData = app.stroage.getValue(mGameSetting.gameName, "");
        return strData.length > 0;
    }

    /** 替换本地存档 */
    public static replaceGameData(strData: string) {
        if (!strData) {
            mLogger.warn("存档数据为空");
            return;
        }
        Tween.stopAllByTarget(GameSave);
        strData = LZString.decompressFromBase64(strData);
        if (!strData || strData.length < 5) {
            mLogger.error("[replaceGameData] 存档解压失败");
            mExecption({ commit: "[replaceGameData] 存档解压失败", message: "" });
        }
        app.stroage.setValue(mGameSetting.gameName, strData);
        GameSave.updateSaveTime(true);
    }

    /** 清除存档(若未强行清除本地数据,云端存档也会失效) */
    public static clearGameData() {
        app.stroage.removeValue(mGameSetting.gameName);
        GameSave.updateSaveTime(true);
    }

    /** 
     * 获取存档时间 毫秒 
     * @ 如果获取的时间小于0 表示强制使用本地存档
     */
    public static getSaveTime() {
        return app.stroage.getValue(saveDataTimeMSKey(), 0);
    }

    /** 更新存档时间 
     * @param forceLocal 是否强制使用本地存档 true会将值设为-1 */
    public static updateSaveTime(forceLocal = false) {
        app.stroage.setValue(saveDataTimeMSKey(), forceLocal ? -1 : mTime.now());
    }

    /** 从本地缓存读取存档 */
    public static deserialize<T extends GameSave>(inst: T): T {
        let parseData = (jsonStr: string) => {
            if (!jsonStr || jsonStr.length == 0) return null;
            try {
                return JSON.parse(jsonStr);
            } catch (error) {//本地存档出错时，使用云端存档
                mLogger.error(error);
                mExecption({ commit: "[deserialize] 放档解析失败", message: jsonStr })
            }
            return null;
        }

        let obj = parseData(app.stroage.getValue(mGameSetting.gameName, ""));
        if (obj) this.mergeValue(inst, obj);

        return inst;
    }

    /** 将数据写入到本地存档中 */
    private static serialize<T extends GameSave>(inst: T) {
        let name = mGameSetting.gameName;
        let jsonStr = this.getSerializeStr(inst);
        app.stroage.setValue(name, jsonStr);
    }

    /** 获取存档序列化后的字符串 */
    private static getSerializeStr<T extends GameSave>(inst: T) {
        return JSON.stringify(inst, (key, value) => {
            if (key.startsWith("__")) return;
            if (key.endsWith(collectionItemSuffix)) return;
            return value;
        });;
    }

    /** 合并存档默认数据和本地数据 */
    private static mergeValue(target: object, source: object) {
        for (const key in target) {
            if (Reflect.has(source, key)) {
                if (key.endsWith(collectionItemSuffix)) continue;
                if (Array.isArray(target[key]) && Array.isArray(source[key])) {//数组
                    target[key] = source[key];
                    if (target[key + collectionItemSuffix]) this.checkMissProperty(target[key], target[key + collectionItemSuffix]);
                } else if (typeof target[key] === "object" && typeof source[key] === "object") {//对象拷贝
                    if (!target[key] || Object.keys(target[key]).length == 0) {//为空或使用空字典存储,完整赋值
                        target[key] = source[key];
                        if (target[key + collectionItemSuffix]) this.checkMissProperty(target[key], target[key + collectionItemSuffix]);
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

