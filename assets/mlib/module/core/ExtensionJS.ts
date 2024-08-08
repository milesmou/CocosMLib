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
        let self: string = this;
        if (!self) return self;
        if (self.length < 2) return self.toUpperCase();
        return self[0].toUpperCase() + self.substring(1);
    }

    String.prototype.lowerFirst = function () {
        let self: string = this;
        if (!self) return self;
        if (self.length < 2) return self.toLowerCase();
        return self[0].toLowerCase() + self.substring(1);
    }
}

declare global {
    /**
     * @deprecated TMD这是DOM的Node,不要使用它
     */
    interface Node { }

    /**
     * @deprecated TMD这是DOM的Animation,不要使用它
     */
    interface Animation { }

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
        delete<T>(item: T): boolean;

        /**
         * 从数组中删除一个元素
         */
        delete<T>(predicate: (value: T, index: number, array: T[]) => boolean): boolean;

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
}