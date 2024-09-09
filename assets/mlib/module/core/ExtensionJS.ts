//扩展JS中的一些类 添加新的方法

import { EDITOR_NOT_IN_PREVIEW } from "cc/env";

if (!EDITOR_NOT_IN_PREVIEW) {//非编辑器模式才生效
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
        return s * Math.floor(Math.abs(value) * multiple) /multiple;
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

    Array.prototype.groupBy = function <T>(groupIdGetter: (value: T) => any) {
        let self: T[] = this;
        let groupMap = new Map<any, T[]>();
        for (const value of self) {
            let groupId = groupIdGetter(value);
            if (!groupMap.has(groupId)) groupMap.set(groupId, []);
            groupMap.get(groupId).push(value)
        }
        return groupMap;
    }

    Array.prototype.isSuperset = function <T>(other: T[]) {
        let self: T[] = this;
        if (self.length <= other.length) return false;
        return self.isSubsetE(other);
    }

    Array.prototype.isSupersetE = function <T>(other: T[]) {
        let self: T[] = this;
        if (self.length < other.length) return false;
        let indexSet: Set<number> = new Set();
        for (const v of other) {
            let index = self.findIndex((v1, i1) => {
                return v1 == v && !indexSet.has(i1);
            });
            if (index > -1) {
                indexSet.add(index);
            } else {
                return false;
            }
        }
        return true;
    }

    Array.prototype.isSubset = function <T>(other: T[]) {
        let self: T[] = this;
        if (self.length >= other.length) return false;
        return self.isSubsetE(other);
    }

    Array.prototype.isSubsetE = function <T>(other: T[]) {
        let self: T[] = this;
        if (self.length > other.length) return false;
        let indexSet: Set<number> = new Set();
        for (const v of self) {
            let index = other.findIndex((v1, i1) => {
                return v1 == v && !indexSet.has(i1);
            });
            if (index > -1) {
                indexSet.add(index);
            } else {
                return false;
            }
        }
        return true;
    }

    Array.prototype.equals = function <T>(other: T[]) {
        let self: T[] = this;
        if (self.length != other.length) return false;
        return self.isSupersetE(other);
    }

    String.prototype.upperFirst = function () {
        if (this.length < 2) return this.toUpperCase();
        return this[0].toUpperCase() + this.substring(1);
    }

    String.prototype.lowerFirst = function () {
        if (this.length < 2) return this.toLowerCase();
        return this[0].toLowerCase() + this.substring(1);
    }

    Map.prototype.find = function <K, V>(predicate: (value: V) => boolean) {
        let self: Map<K, V> = this;
        for (const kv of self) {
            if (predicate(kv[1])) return kv[1];
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
            }
        }
        return undefined;
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
}

declare global {

    /** 通用进度回调方法的声明 */
    type Progress = (loaded: number, total: number) => void;
    /** 无返回值的方法声明 */
    type Action<T1 = any, T2 = any, T3 = any, T4 = any, T5 = any> = (arg1?: T1, arg2?: T2, arg3?: T3, arg4?: T4, arg5?: T5) => void;

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
        groupBy(groupIdGetter: (value: T) => any): Map<any, T[]>;
        /**
         * 是否是另一个数组的父集
         */
        isSuperset(other: T[]): boolean;
        /**
         * 是否是另一个数组的父集或相等
         */
        isSupersetE(other: T[]): boolean;
        /**
         *  是否是另一个数组的子集
         */
        isSubset(other: T[]): boolean;
        /**
         *  是否是另一个数组的子集或相等
         */
        isSubsetE(other: T[]): boolean;
        /** 
         * 是否和另一个数组中元素相同
         */
        equals(other: T[]): boolean;
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
         * 查找符合要求的元素
         */
        find(predicate: (value: V) => boolean): V | undefined;
        /** 
         * 是否有符合要求的元素
         */
        hasP(predicate: (value: V) => boolean): boolean;
        /** 
         * 删除符合要求的元素
         */
        deleteP(predicate: (value: V) => boolean): boolean;
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
}