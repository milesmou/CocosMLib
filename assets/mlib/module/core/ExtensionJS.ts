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

    String.prototype.upperFirst = function () {
        let self = this;
        if (!self) return self;
        if (self.length < 2) return self.toUpperCase();
        return self[0].toUpperCase() + self.substring(1);
    }

    String.prototype.lowerFirst = function () {
        let self = this;
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
        delete<T>(predicate: (value: T, index: number, obj: T[]) => boolean): boolean;

        /**
        * 从数组中随机返回一个值，并将它从数组中移除
        */
        random(): T | undefined;

        /**
         * 数组随机打乱
         */
        disarrange();
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