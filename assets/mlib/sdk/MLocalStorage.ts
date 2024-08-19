import { sys } from "cc";

/**
 *  用于原生平台操作本地存储的类
 *  方便将原生平台的一些值传递给JS层使用
 */
export class MLocalStorage {
    private static isInit = false;

    public static init() {
        if (this.isInit) return;
        this.isInit = true;
        globalThis.onNativeLocalStorage = this.onNativeLocalStorage.bind(this);
    }

    private static onNativeLocalStorage(cmd: string, key: string, value?: string) {
        logger.debug('MLocalStorage', cmd, key, value)
        switch (cmd) {
            case "setItem":
                sys.localStorage.setItem(key, value);
                break;
            case "removeItem":
                sys.localStorage.removeItem(key);
                break;
        }
    }




}

MLocalStorage.init();

declare global {
    /** 原生平台操作本地存储方法 */
    var onNativeLocalStorage: (cmd: string, key: string, value?: string) => void;
}