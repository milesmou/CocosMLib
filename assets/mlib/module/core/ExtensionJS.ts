//扩展JS中的一些类 添加新的方法

import { EDITOR_NOT_IN_PREVIEW } from "cc/env";

if (!EDITOR_NOT_IN_PREVIEW) {//非编辑器模式才生效

    //@ts-ignore
    globalThis.PromiseAll = function (promises: Promise<any>[], progress?: Progress) {
        return new Promise<void>((resolve, reject) => {
            let completedCount = 0;
            if (!promises || promises.length == 0) {
                resolve();
            }
            promises.forEach((promise) => {
                Promise.resolve(promise).then(() => {
                    completedCount++;
                    progress && progress(completedCount, promises.length);
                    if (completedCount == promises.length) {
                        resolve();
                    }
                }).catch(reject);
            });
        });
    }

    Object.defineProperty(Array.prototype, "first", {
        get: function () {
            let self: any[] = this;
            if (self.length == 0) return undefined;
            return self[0];
        }
    })

    Object.defineProperty(Array.prototype, "last", {
        get: function () {
            let self: any[] = this;
            if (self.length == 0) return undefined;
            return self[self.length - 1];
        }
    })

    Number.prototype.fixFraction = function (len: number) {
        let value = this.valueOf();
        if (!(len > 0)) return value;
        let s = value > 0 ? 1 : -1;
        let multiple = 10 ** len;
        return s * Math.floor(Math.abs(value) * multiple) / multiple;
    }

    Array.prototype.delete = function <T>(itemOrPredicate: T | ((value: T, index: number, obj: T[]) => unknown)) {
        let self: T[] = this;
        let index = -1;
        if (typeof itemOrPredicate === "function") {
            index = self.findIndex(itemOrPredicate as any);
        } else {
            index = self.indexOf(itemOrPredicate);
        }
        if (index > -1) {
            self.splice(index, 1);
            return true;
        }
        return false;
    }

    Array.prototype.random = function <T>() {
        let self: T[] = this;
        if (self.length == 0) return undefined;
        let index = Math.floor(Math.random() * self.length);
        return self[index];
    }

    Array.prototype.randomR = function <T>() {
        let self: T[] = this;
        if (self.length == 0) return undefined;
        let index = Math.floor(Math.random() * self.length);
        let value: T = self[index];
        self.splice(index, 1);
        return value;
    }

    Array.prototype.disarrange = function <T>() {
        let self: T[] = this;
        for (let i = 0; i < self.length; i++) {
            let index = Math.floor(Math.random() * self.length);
            let tmp = self[i];
            self[i] = self[index];
            self[index] = tmp;
        }
    }

    Array.prototype.groupBy = function <T, ID = any>(groupIdGetter: (value: T) => ID) {
        let self: T[] = this;
        let groupMap = new Map<ID, T[]>();
        for (const value of self) {
            let groupId = groupIdGetter(value);
            if (!groupMap.has(groupId)) groupMap.set(groupId, []);
            groupMap.get(groupId).push(value)
        }
        return groupMap;
    }

    Array.prototype.isSubset = function <T>(other: T[]) {
        let self: T[] = this;
        return self.length < other.length && self.isSubsetE(other);
    }

    Array.prototype.isSubsetE = function <T>(other: T[]) {
        let self: T[] = this;
        if (self.length == 0) return true;
        const supersetCount = new Map<T, number>();
        for (const item of other) {
            supersetCount.set(item, (supersetCount.get(item) ?? 0) + 1);
        }
        for (const item of self) {
            const count = supersetCount.get(item) ?? 0;
            if (count === 0) {
                return false;
            }
            supersetCount.set(item, count - 1);
        }
        return true;
    }

    Array.prototype.equals = function <T>(other: T[]) {
        let self: T[] = this;
        return self.length == other.length && self.isSubsetE(other);
    }

    Array.prototype.intersect = function <T>(other: T[]) {
        let self: T[] = this;
        const set = new Set(self);
        for (const item of other) {
            if (set.has(item)) {
                return true;
            }
        }
        return false;
    }

    String.prototype.upperFirst = function () {
        if (this.length < 2) return this.toUpperCase();
        return this[0].toUpperCase() + this.substring(1);
    }

    String.isNullOrWhiteSpace = function (str: string) {
        if (!str) return true;
        return str.trim() === "";
    }

    String.prototype.lowerFirst = function () {
        if (this.length < 2) return this.toLowerCase();
        return this[0].toLowerCase() + this.substring(1);
    }

    Map.prototype.getKey = function <K, V>(value: V) {
        let self: Map<K, V> = this;
        for (const kv of self) {
            if (kv[1] == value) return kv[0];
        }
        return undefined;
    }

    Map.prototype.find = function <K, V>(predicate: (value: V, key: K) => boolean) {
        let self: Map<K, V> = this;
        for (const kv of self) {
            if (predicate(kv[1], kv[0])) return kv[1];
        }
        return undefined;
    }

    Map.prototype.hasP = function <K, V>(predicate: (value: V) => boolean) {
        let self: Map<K, V> = this;
        return self.find(predicate) !== undefined;
    }

    Map.prototype.deleteP = function <K, V>(predicate: (value: V) => boolean) {
        let self: Map<K, V> = this;
        for (const kv of self) {
            if (predicate(kv[1])) {
                self.delete(kv[0]);
                return true;
            }
        }
        return false;
    }

    Map.prototype.deleteV = function <K, V>(value: V) {
        let self: Map<K, V> = this;
        for (const kv of self) {
            if (kv[1] == value) {
                self.delete(kv[0]);
                return true;
            }
        }
        return false;
    }

    Map.prototype.toArray = function <K, V>() {
        let self: Map<K, V> = this;
        let array: [K, V][] = [];
        self.forEach((v, k) => {
            array.push([k, v]);
        });
        return array;
    }

    Set.prototype.find = function <T>(predicate: (value: T) => boolean) {
        let self: Set<T> = this;
        for (const v of self) {
            if (predicate(v)) return v;
        }
        return undefined;
    }

    Set.prototype.hasP = function <T>(predicate: (value: T) => boolean) {
        let self: Set<T> = this;
        return self.find(predicate) !== undefined;
    }

    Set.prototype.deleteP = function <T>(predicate: (value: T) => boolean) {
        let self: Set<T> = this;
        for (const v of self) {
            if (predicate(v)) {
                self.delete(v);
                return true;
            }
        }
        return false;
    }

    Set.prototype.toArray = function <T>() {
        let self: Set<T> = this;
        let array: T[] = [];
        self.forEach(v => {
            array.push(v);
        });
        return array;
    }

    Date.nowS = function () {
        return Math.floor(Date.now() / 1000);
    }

    Date.nowYMD = function () {
        return new Date().getYMD();
    }

    Date.prototype.getTimeS = function () {
        let self: Date = this;
        return Math.floor(self.getTime() / 1000);
    }

    Date.prototype.getYMD = function () {
        let self: Date = this;
        let lt10 = (v: number) => {
            return v < 10 ? "0" + v : v.toString();
        }
        let str = self.getFullYear() + lt10(self.getMonth() + 1) + lt10(self.getDate());
        return parseInt(str);
    }

    Date.prototype.addYears = function (years: number, returnNew?: boolean) {
        let self: Date = this;
        if (returnNew) self = new Date(self.getTime());
        self.setFullYear(self.getFullYear() + years);
        return self;
    }

    Date.prototype.addMonths = function (months: number, returnNew?: boolean) {
        let self: Date = this;
        if (returnNew) self = new Date(self.getTime());
        self.setMonth(self.getMonth() + months);
        return self;
    }

    Date.prototype.addDays = function (days: number, returnNew?: boolean) {
        let self: Date = this;
        if (returnNew) self = new Date(self.getTime());
        self.setDate(self.getDate() + days);
        return self;
    }

    Date.prototype.addHours = function (hours: number, returnNew?: boolean) {
        let self: Date = this;
        if (returnNew) self = new Date(self.getTime());
        self.setHours(self.getHours() + hours);
        return self;
    }

    Date.prototype.addMinutes = function (minutes: number, returnNew?: boolean) {
        let self: Date = this;
        if (returnNew) self = new Date(self.getTime());
        self.setMinutes(self.getMinutes() + minutes);
        return self;
    }

    Date.prototype.addSeconds = function (seconds: number, returnNew?: boolean) {
        let self: Date = this;
        if (returnNew) self = new Date(self.getTime());
        self.setSeconds(self.getSeconds() + seconds);
        return self;
    }
}

declare global {

    /** 通用进度回调方法的声明 */
    type Progress = (loaded: number, total: number) => void;
    
    /** 通用结果回调方法的参数 */
    interface ResultParam {
        /** 结果码 0:成功 1失败 2错误 其它根据需求自定义 */
        code: number,
        /** 数据 */
        data?: string
        /** 错误信息 */
        msg?: string,
    }

    /** 通用结果回调方法 */
    type ResultCallback = (result: ResultParam) => void;

    /** 无返回值的方法声明 */
    type Action<T1 = undefined, T2 = undefined, T3 = undefined, T4 = undefined, T5 = undefined> = (arg1?: T1, arg2?: T2, arg3?: T3, arg4?: T4, arg5?: T5) => void;

    /** 建立一个所有异步操作都完成的异步操作 */
    const PromiseAll: (promises: Promise<any>[], progress?: Progress) => Promise<void>;

    interface Number {
        /** 
         * 保留指定小数位数(丢弃多余的小数位数)
         * @param len 小数位数
         */
        fixFraction(len: number): number;
    }

    interface Array<T> {
        /**
        * 第一个元素
        */
        get first(): T | undefined;
        /** 
         * 最后一个元素
         */
        get last(): T | undefined;
        /**
         * 从数组中删除一个元素
         */
        delete(item: T): boolean;
        /**
         * 从数组中删除一个元素
         */
        delete(predicate: (value: T, index: number, array: T[]) => boolean): boolean;
        /**
        * 从数组中随机返回一个值
        */
        random(): T | undefined;
        /**
        * 从数组中随机返回一个值，并将它从数组中移除
        */
        randomR(): T | undefined;
        /**
         * 数组随机打乱
         */
        disarrange(): void;
        /** 
         * 将集合中的数据按规则进行分组
         */
        groupBy<ID = any>(groupIdGetter: (value: T) => ID): Map<ID, T[]>;
        /**
         *  是否是另一个数组的子集
         */
        isSubset(other: T[]): boolean;
        /**
         *  是否是另一个数组的子集或相同
         */
        isSubsetE(other: T[]): boolean;
        /** 
         * 是否和另一个数组中元素相同
         */
        equals(other: T[]): boolean;
        /**
         * 是否和另一个数组有相同元素
         */
        intersect(other: T[]): boolean;
    }

    interface StringConstructor {
        /** 字符串是否为null、undefined、""、纯空格 */
        isNullOrWhiteSpace(str: string): boolean;
    }

    interface String {
        /**
         * 首字母大写
         */
        upperFirst(): string;
        /**
         * 首字母小写 
         */
        lowerFirst(): string;
    }

    interface Map<K, V> {
        /**
         * 通过值获取key,返回第一个符合要求的
         */
        getKey(value: V): K | undefined;
        /**
         * 查找符合要求的元素
         */
        find(predicate: (value: V, key?: K) => boolean): V | undefined;
        /** 
         * 是否有符合要求的元素
         */
        hasP(predicate: (value: V) => boolean): boolean;
        /** 
         * 删除符合要求的元素
         */
        deleteP(predicate: (value: V) => boolean): boolean;
        /** 
         * 删除指定的值
         */
        deleteV(value: V): boolean;
        /** 
         * 转化为一个二维数组
         */
        toArray(): [K, V][];
    }

    interface Set<T> {
        /** 
         * 查找符合要求的元素 
         */
        find(predicate: (value: T) => boolean): T | undefined;
        /** 
         * 是否有符合要求的元素
         */
        hasP(predicate: (value: T) => boolean): boolean;
        /** 
         * 删除符合要求的元素
         */
        deleteP(predicate: (value: T) => boolean): boolean;
        /** 
         * 转化为一个数组
         */
        toArray(): T[];
    }

    interface DateConstructor {
        /** 返回当前时间的秒级时间戳 */
        nowS(): number;
        /** 返回当前时间的年月日 例:20010101 */
        nowYMD(): number;
    }

    interface Date {
        /** 返回时间对象的秒级时间戳 */
        getTimeS(): number;
        /** 返回时间对象的年月日 例:20010101 */
        getYMD(): number;
        /** 增加指定的年 returnNew:是否返回一个新的时间对象,默认false */
        addYears(years: number, returnNew?: boolean): Date;
        /** 增加指定的月 returnNew:是否返回一个新的时间对象,默认false */
        addMonths(months: number, returnNew?: boolean): Date;
        /** 增加指定的天 returnNew:是否返回一个新的时间对象,默认false */
        addDays(days: number, returnNew?: boolean): Date;
        /** 增加指定的小时 returnNew:是否返回一个新的时间对象,默认false */
        addHours(hours: number, returnNew?: boolean): Date;
        /** 增加指定的分钟 returnNew:是否返回一个新的时间对象,默认false */
        addMinutes(minutes: number, returnNew?: boolean): Date;
        /** 增加指定的秒 returnNew:是否返回一个新的时间对象,默认false */
        addSeconds(seconds: number, returnNew?: boolean): Date;
    }

}