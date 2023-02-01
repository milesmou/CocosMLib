import { ImageAsset, SpriteFrame } from 'cc';
import { Sprite, Component, Node, Asset, assetManager, sys, resources, AssetManager } from 'cc';

/**
 * 常用的一些方法工具类
 */
export class Utils {
    /**
     * 加载图片到Sprite
     * @param sprite 目标Sprite组件
     * @param url 路径（本地路径不带扩展名 远程路径带扩展名）
     */
    static loadSprite(sprite: Sprite, url: string) {
        let p = new Promise<void>((resolve, reject) => {
            let onComplete = (err: any, res: SpriteFrame | ImageAsset) => {
                if (err) {
                    console.error(err);
                    reject();
                } else {
                    if (res instanceof ImageAsset) {
                        let spriteFrame = new SpriteFrame();
                        spriteFrame.texture = res._texture;
                        sprite.spriteFrame = spriteFrame;
                    } else {
                        sprite.spriteFrame = res;
                    }
                    resolve();
                }
            };
            if (url.startsWith("http") || url.startsWith("/")) {
                assetManager.loadRemote(url, { ext: url.substring(url.lastIndexOf(".")) }, onComplete);
            } else {
                resources.load(url + "/spriteFrame", SpriteFrame, onComplete);
            }
        })
        return p;
    }

    /** 从节点的一级子节点获取指定组件 */
    static getComponentInChildren<T extends Component>(obj: Node, type: new (...args: any[]) => T): T {
        for (let i = 0; i < obj.children.length; i++) {
            let child = obj.children[i];
            let comp = child.getComponent(type);
            if (comp) return comp;
        }
        return null!;
    }

    /**
     * 返回今天的日期,格式20200101
     */
    static getToday() {
        let lt10 = (v: number) => {
            return v < 10 ? "0" + v : "" + v;
        }
        let date = new Date();
        let str = date.getFullYear() + lt10(date.getMonth() + 1) + lt10(date.getDate());
        return parseInt(str);
    }

    /**
     * 计算两个日期的天数差 日期格式20200101
     */
     static deltaDay(date1: number, date2: number) {
        let str1 = date1.toString();
        let str2 = date2.toString();
        if (str1.length == 8 && str2.length==8) {
            let d1 = new Date(str1.substr(4, 2) + "/" + str1.substr(6, 2) + "/" + str1.substr(0, 4));
            let d2 = new Date(str2.substr(4, 2) + "/" + str2.substr(6, 2) + "/" + str2.substr(0, 4));
            let days = Math.abs(d1.getTime() - d2.getTime()) / (24 * 60 * 60 * 1000);
            return Math.floor(days);
        } else {
            console.error("日期格式不正确");
            return -1;
        }
    }

    /**
     * 将事件戳转化为日期格式,适用于显示倒计时
     * @param timeMS 倒计时的时间戳(MS)
     * @param template 模板 1(HH:MM:SS) 2(HH时MM分SS秒) 3(HH?:MM:SS) 4(HH?时MM分SS秒)
     * @param separator 分隔符 默认(:)
     */
    static formatTimeMS(timeMS: number, template: 1 | 2 | 3 | 4, separator = ":"): string {
        let str: string = "";
        let lt10 = (v: number) => {
            return v < 10 ? "0" + v : v;
        }
        let date = new Date();
        let offset = date.getTimezoneOffset();//时区差异 minutes
        date.setTime(timeMS + offset * 60 * 1000);
        let days = date.getDate() - 1;
        let hours = date.getHours() + days * 24;
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        if (template == 1) {
            str = `${lt10(hours)}${separator}${lt10(minutes)}${separator}${lt10(seconds)}`;
        } else if (template == 2) {
            str = `${lt10(hours)}时${lt10(minutes)}分${lt10(seconds)}秒`;
        } else if (template == 3) {
            str = hours > 0 ? `${lt10(hours)}${separator}` : "";
            str += `${lt10(minutes)}${separator}${lt10(seconds)}`
        } else if (template == 4) {
            str = hours > 0 ? `${lt10(hours)}时` : "";
            str += `${lt10(minutes)}分${lt10(seconds)}秒`
        }
        return str;
    }

    /**
     * 获取一个随机数，区间[min,max]
     * @param min 最小值
     * @param max 最大值
     * @param isInteger 是否是整数 默认true
     */
    static randomNum(min: number, max: number, isInteger = true) {
        let delta = max - min;
        let value = Math.random() * delta + min;
        if (isInteger) {
            value = Math.round(value);
        }
        return value;
    }


    /**
     * 格式化字符串,用args的内容替换str中的{i},i从0开始
     */
    static formatString(str: string, ...args: any[]) {
        args.forEach((v, i) => {
            str = str.replace(`{${i}}`, v);
        });
        return str;
    }

    /**
     * 将 cc.resources.load Promise化
     */
    static load(path: string, type: typeof Asset | null, onProgress: (finish: number, total: number, item: AssetManager.RequestItem) => void | null): Promise<Asset> {
        let p = new Promise<Asset>((resolve, reject) => {
            resources.load(path, type, onProgress, (err, asset) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(asset);
                }
            })
        })
        return p;
    }

    /**
    * 将 cc.resources.load Promise化
    */
    static loadArray(path: string[], type: typeof Asset | null, onProgress: (finish: number, total: number, item: AssetManager.RequestItem) => void | null): Promise<Asset[]> {
        let p = new Promise<Asset[]>((resolve, reject) => {
            resources.load(path, type, onProgress, (err, asset) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(asset);
                }
            })
        })
        return p;
    }

    /**
     * 将 cc.assetManager.loadRemote Promise化
     */
    static loadRemote(url: string): Promise<Asset> {
        let ext = url.substring(url.lastIndexOf("."));
        let p = new Promise<Asset>((resolve, reject) => {
            assetManager.loadRemote(url, { ext: ext }, (err, asset) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(asset);
                }
            })
        })
        return p;
    }

    /**
     * 将 cc.resources.loadDir Promise化
     */
    static loadDir(path: string, onProgress: (finish: number, total: number, item: AssetManager.RequestItem) => void | null): Promise<Asset[]> {
        let p = new Promise<Asset[]>((resolve, reject) => {
            resources.loadDir(path, onProgress, (err, assets) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(assets);
                }
            })
        })
        return p;
    }

    static downloadProgress: Map<string, Function[]> = new Map();
    /**
     * 原生平台下载文件到本地
     * @param url 文件下载链接
     * @param onFileProgress 文件下载进度回调(同一url仅第一次传入的回调有效)
     */
    static download(url: string, onFileProgress?: (loaded: number, total: number) => void) {
        let ext = url.substr(url.lastIndexOf("."));
        if (!this.downloadProgress.get(url)) {
            this.downloadProgress.set(url, []);
        }
        if (onFileProgress) {
            this.downloadProgress.get(url)?.push(onFileProgress);
        }
        let p = new Promise<any>((resolve, reject) => {
            if (sys.isBrowser) {
                resolve(url);
            }
            assetManager.downloader.download(
                url, url, ext,
                {
                    onFileProgress: (loaded: number, total: number) => {
                        let arr = this.downloadProgress.get(url)!;
                        arr.forEach(v => v(loaded, total));
                    }
                },
                (err, res) => {
                    this.downloadProgress.delete(url);
                    if (err) {
                        console.log("download fail", err?.message);
                        reject(err);
                    } else {
                        resolve(res);
                    }
                }
            )
        })
        return p;
    }
}