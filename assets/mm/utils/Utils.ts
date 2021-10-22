import { app } from "../App";
import { BundleKey, BundleMgr } from "../manager/BundleMgr";

/**
 * 常用的一些方法集合
 */
export class Utils {

    static delayToDo(callbck: () => void, dur = 0) {
        app.Inst.scheduleOnce(callbck, dur)
    }

    /**
     * 加载图片到Sprite
     * @param sprite 目标Sprite组件
     * @param url 路径（本地路径不带扩展名 远程路径带扩展名）
     * @param bundleKey 从哪个AssetBundle加载本地图片 默认为resources
     */
    static loadPicture(sprite: cc.Sprite, url: string, bundleKey?: BundleKey) {
        let p = new Promise<void>((resolve, reject) => {
            let onComplete = (err, res: cc.SpriteFrame | cc.Texture2D) => {
                if (err) {
                    cc.error(err);
                    reject();
                } else {
                    if (res instanceof cc.Texture2D) {
                        res = new cc.SpriteFrame(res);
                    }
                    sprite.spriteFrame = res;
                    resolve();
                }
            };
            if (url.startsWith("http")) {
                cc.assetManager.loadRemote(url, onComplete);
            } else {
                url = Utils.formatString(url, app.lang);
                let bundle = bundleKey ? BundleMgr.Inst.getBundle(bundleKey) : cc.resources;
                if (bundle) {
                    if (!bundle.get(url, cc.SpriteFrame)) {
                        sprite.spriteFrame = null;
                    }
                    bundle.load(url, cc.SpriteFrame, onComplete);
                } else {
                    cc.error(bundleKey + " bundle不存在");
                    reject(bundleKey + " bundle不存在");
                }
            }
        })
        return p;
    }

    /**
   * 返回今天的日期,格式20200101
   */
    static getToday() {
        let lt10 = v => {
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
        if (str1.length == 8 && str2.length == 8) {
            let d1 = new Date(str1.substr(4, 2) + "/" + str1.substr(6, 2) + "/" + str1.substr(0, 4));
            let d2 = new Date(str2.substr(4, 2) + "/" + str2.substr(6, 2) + "/" + str2.substr(0, 4));
            let days = Math.abs(d1.getTime() - d2.getTime()) / (24 * 60 * 60 * 1000);
            return Math.floor(days);
        } else {
            cc.error("日期格式不正确");
            return -1;
        }
    }

    /**
     * 将事件戳转化为日期格式,适用于显示倒计时
     * @param timeMS 倒计时的时间戳(MS)
     * @param template 模板 1(HH:MM:SS) 2(HH时MM分SS秒) 3(HH?:MM:SS) 4(HH?时MM分SS秒)
     * @param separator 分隔符 默认(:)
     */
    static formatTimeMS(timeMS: number, template: 1 | 2 | 3 | 4, separator = ":") {
        let str: string;
        let lt10 = v => {
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

    /** 从数组中随机获取一个值 */
    static randomValue<T>(arr: T[], exclude?: T[]) {
        if (!arr) return;
        let newArr = arr.concat();
        if (exclude) {
            this.delItemFromArray(newArr, ...exclude)
        }
        let index = this.randomNum(0, newArr.length - 1);
        return newArr[index];
    }

    /**
     *  修正小数位数
     * @param fractionDigits 保留小数位数
     * @param canEndWithZero 是否需要用0填补小数位数 默认为true
     */
    static fixFloat(value: number, fractionDigits: number, canEndWithZero = true) {
        if (fractionDigits < 0) fractionDigits = 0;
        let str = value.toFixed(fractionDigits);
        if (canEndWithZero) {
            return str;
        } else {
            while (true) {
                if (str.length > 1) {
                    if (str.endsWith("0") || str.endsWith(".")) {
                        str = str.substring(0, str.length - 1);
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
        }
        return str;
    }

    /**
     * 格式化字符串,用args的内容替换str中的{i},i从0开始
     */
    static formatString(str: string, ...args) {
        args.forEach((v, i) => {
            str = str.replace(`{${i}}`, v);
        });
        return str;
    }

    /**
     * 简单的数字缓动
     * 从start缓动end
     */
    static tweenTo(start: number, end: number, dur: number, onProgress?: (value: number) => void, onEnd?: () => void) {
        let obj = { x: start };
        cc.tween(obj)
            .to(dur, { x: end }, {
                progress: (start, end, current, ratio) => {
                    let v = start + (end - start) * ratio;
                    onProgress && onProgress(v);
                    return v;
                }
            })
            .call(onEnd)
            .start();
    }

    /** 分帧加载一个列表 默认以content的第一个子节点为模版 否则需要传入instFunc,返回一个item节点
     * @param params 对content下多余的item的处理 type:1=隐藏(默认) 2=销毁 3=手动回收(需传入recycleFunc进行回收) dt分帧加载每帧耗时(毫秒)
     */
    static loadItemList<T>(dataList: T[], content: cc.Node, execute: (data: T, item: cc.Node, index?: number) => void, params?: { type?: 1 | 2 | 3, dt?: number, instFunc?: () => cc.Node, recycleFunc?: (item: cc.Node) => void, onComplete?: () => void }) {
        if (!content) {
            cc.error("content节点为null");
            return;
        }
        if (content.childrenCount == 0 && !params?.instFunc) {
            cc.error("Content下无默认子节点且没有传入instFunc");
            return;
        }
        dataList = dataList || [];
        if (content.childrenCount > dataList.length) {
            let toDeal = content.children.slice(dataList.length);
            let { type, recycleFunc } = params || {};
            type = type || 1;
            if (type == 1 || type == 2 || (type == 3 && recycleFunc)) {
                toDeal.forEach(v => {
                    if (type == 1) {
                        v.active = false;
                    } else if (type == 2) {
                        v.destroy();
                    } else {
                        recycleFunc(v);
                    }
                })
            }
        }
        let gen = function* () {
            for (let i = 0; i < dataList.length; i++) {
                const v = dataList[i];
                let func = () => {
                    if (!content?.isValid) return;
                    let itemNode = content.children[i];
                    if (!itemNode) {
                        if (params?.instFunc) {
                            itemNode = params.instFunc();
                        } else {
                            itemNode = cc.instantiate(content.children[0]);
                        }
                        itemNode.parent = content;
                    }
                    itemNode.active = true;
                    execute && execute(v, itemNode, i);
                }
                yield func;
            }
        }();
        this.frameLoad(gen, params?.dt || 4).then(() => {
            params?.onComplete && params.onComplete();
        });
    }

    /**
     * 分帧加载
     * @param gen 迭代器
     * @param target 执行分帧加载的组件
     * @param dt 每帧耗时(毫秒)
     */
    static frameLoad(gen: Generator, dt = 4) {
        let p = new Promise<void>((resolve, reject) => {
            let execute = () => {
                let d1 = Date.now();
                for (let e = gen.next(); ; e = gen.next()) {
                    if (!e || e.done) {
                        resolve();
                        break;
                    }
                    if (typeof e.value == "function") {
                        e.value();
                    }
                    let d2 = Date.now();
                    if (d2 - d1 >= dt) {
                        new cc.Component().scheduleOnce(execute);
                        break;
                    }
                }
            }
            execute();
        });
        return p;
    }

    /**
     * 将 AssetBundle load Promise化
     */
    static load<T extends cc.Asset>(path: string, type?: { new(): T }, onProgress?: (finish: number, total: number) => void, bundleKey?: BundleKey): Promise<T> {
        let p = new Promise<T>((resolve, reject) => {
            let bundle = bundleKey ? BundleMgr.Inst.getBundle(bundleKey) : cc.resources;
            if (bundle) {
                bundle.load(path, type as any, onProgress, (err, asset: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(asset);
                    }
                })
            } else {
                cc.error(bundleKey + " bundle不存在");
                reject(bundleKey + " bundle不存在");
            }
        })
        return p;
    }

    /**
     * 将 AssetBundle load Promise化
     */
    static loadArray(path: string[], type?: typeof cc.Asset, onProgress?: (finish: number, total: number) => void, bundleKey?: BundleKey): Promise<cc.Asset[]> {
        let p = new Promise<cc.Asset[]>((resolve, reject) => {
            let bundle = bundleKey ? BundleMgr.Inst.getBundle(bundleKey) : cc.resources;
            if (bundle) {
                bundle.load(path, type, onProgress, (err, asset) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(asset);
                    }
                })
            } else {
                cc.error(bundleKey + " bundle不存在");
                reject(bundleKey + " bundle不存在");
            }
        })
        return p;
    }

    /**
  * 将 cc.assetManager.loadRemote Promise化
  */
    static loadRemote(path: string): Promise<cc.Asset> {
        let p = new Promise<cc.Asset>((resolve, reject) => {
            cc.assetManager.loadRemote(path, (err, asset) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(asset);
                }
            })
        })
        return p;
    }

    /**
    * 将 AssetBundle loadDir Promise化
    */
    static loadDir(path: string, onProgress?: (finish: number, total: number) => void, bundleKey?: BundleKey): Promise<cc.Asset[]> {
        let p = new Promise<cc.Asset[]>((resolve, reject) => {
            let bundle = bundleKey ? BundleMgr.Inst.getBundle(bundleKey) : cc.resources;
            if (bundle) {
                bundle.loadDir(path, onProgress, (err, assets) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(assets);
                    }
                })
            } else {
                cc.error(bundleKey + " bundle不存在");
                reject(bundleKey + " bundle不存在")
            }
        })
        return p;
    }


    private static downloadProgress: Map<string, Function[]> = new Map();
    /**
     * 下载文件  原生平台下载文件到本地 浏览器加载资源
     * @param url 文件下载链接
     * @param onFileProgress 文件下载进度回调
     */
    static download(url: string, onFileProgress?: (loaded: number, total: number) => void) {
        if (cc.sys.isBrowser) {
            return this.loadRemote(url);
        } else {
            let ext = url.substr(url.lastIndexOf("."));
            if (!this.downloadProgress.get(url)) {
                this.downloadProgress.set(url, []);
            }
            if (onFileProgress) {
                this.downloadProgress.get(url).push(onFileProgress);
            }
            let p = new Promise<any>((resolve, reject) => {
                cc.assetManager.downloader.download(
                    url, url, ext,
                    {
                        onFileProgress: (loaded: number, total: number) => {
                            let arr = this.downloadProgress.get(url);
                            arr.forEach(v => v(loaded, total));
                        }
                    },
                    (err, res) => {
                        this.downloadProgress.delete(url);
                        if (err) {
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

    static delItemFromArray<T>(arr: T[], ...item: T[]) {
        if (arr.length > 0 && item.length > 0) {
            item.forEach(v => {
                let index = arr.indexOf(v);
                if (index > -1) {
                    arr.splice(index, 1);
                }
            })
        }
    }

    /** 统计元素在数组中出现次数 */
    static countValueTimes<T>(arr: T[], value: T, predicate: (value: T) => boolean) {
        let times = 0;
        arr.forEach(v => {
            if (predicate(v)) {
                times++;
            }
        })
        return times;
    }

    /** 生成UUID */
    static genUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /** 设置spine各动画之间的融合时间 */
    static setSpineCommonMix(spine: sp.Skeleton, dur: number) {
        if (!spine) return;
        let anims: any[] = spine["_skeleton"]["data"]["animations"];
        if (anims?.length) {
            for (let i = 0; i < anims.length - 1; i++) {
                for (let j = i + 1; j < anims.length; j++) {
                    spine.setMix(anims[i].name, anims[j].name, dur);
                    spine.setMix(anims[j].name, anims[i].name, dur);
                }
            }
        }
    }
}
