/**
 * 常用的一些方法集合
 */
export class Utils {
    /**
    * 加载远程图片
    * @param sprite 目标Sprite组件 
    * @param url 远程图片路径（带扩展名）
    */
    static loadRemotePic(sprite: cc.Sprite, url: string) {
        let p = new Promise<void>((resolve, reject) => {
            cc.assetManager.loadRemote(url, (err, texture: any) => {
                if (err) {
                    console.error(err);
                } else {
                    let spFrame = new cc.SpriteFrame(texture);
                    sprite.spriteFrame = spFrame;
                    resolve();
                }
            });
        })
        return p;
    }

    /**
     * 加载本地图片
     * @param sprite 目标Sprite组件
     * @param url 本地图片路径（不带扩展名）
     */
    static loadLocalPic(sprite: cc.Sprite, url: string) {
        let p = new Promise<void>((resolve, reject) => {
            cc.resources.load(url, cc.SpriteFrame, (err, texture: any) => {
                if (err) {
                    console.error(err);
                } else {
                    sprite.spriteFrame = texture;
                    resolve();
                }
            });
        })
        return p;
    }

    /** 
     * 为按钮绑定事件,重复的事件不会再次绑定
     */
    static bindButtonEvent(button: cc.Button, target: cc.Node, component: string, handler: string, customData?: any) {
        let clickEvents = button.clickEvents;
        let eventHandler = clickEvents.find(v => {
            return v.target == target && v.component == component &&
                v.handler == v.handler && v.customEventData == customData;
        });
        if (!eventHandler) {
            eventHandler = new cc.Component.EventHandler();
            eventHandler.target = target;
            eventHandler.component = component;
            eventHandler.handler = handler;
            eventHandler.customEventData = customData;
            button.clickEvents.push(eventHandler);
        }
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
     * arr1是否包含arr2所有元素
     */
    static isArrContained(arr1: any[], arr2: any[]) {
        let arr = arr2.filter(v => arr1.includes(v));
        return arr.length == arr2.length;
    }

    /**
     * 获取一个随机数
     * @param min 最小值
     * @param max 最大值
     * @param isInteger 是否是整数 默认true
     */
    static getRandomNum(min: number, max: number, isInteger = true) {
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
    static formatString(str: string, ...args) {
        args.forEach((v, i) => {
            str = str.replace(`{${i}}`, v);
        });
        return str;
        Promise
    }

    /**
     * 将 cc.resources.load Promise化
     */
    static load(path: string, type?: typeof cc.Asset, onProgress?: (finish: number, total: number) => void): Promise<cc.Asset> {
        let p = new Promise<cc.Asset>((resolve, reject) => {
            cc.resources.load(path, type, onProgress, (err, asset) => {
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
     * 在cc.resources.load基础上增加一个数组资源加载
     */
    static loadArray(paths: string[], onProgress?: (finish: number, total: number) => void): Promise<cc.Asset[]> {
        let finishArr: number[] = [], totalArr: number[] = [];
        let assets: cc.Asset[] = [];
        let p = new Promise<cc.Asset[]>((resolve, reject) => {
            paths.forEach((path, i) => {
                cc.resources.load(path,
                    (_finish, _total) => {
                        finishArr[i] = _finish || 0;
                        totalArr[i] = _total || 0;
                        if (onProgress) {
                            let finish = 0;
                            let total = 0;
                            for (let i = 0; i < paths.length; i++) {
                                finish += (finishArr[i] || 0);
                                total += (totalArr[i] || 0);
                            }
                            onProgress(finish, total);
                        }
                    },
                    (err, asset) => {
                        if (err) {
                            reject(err)
                        } else {
                            assets.push(asset);
                            if (assets.length == paths.length) {
                                resolve(assets);
                            }
                        }
                    })
            });
        })
        return p;
    }

    /**
    * 将 cc.resources.loadDir Promise化
    */
    static loadDir(path: string, onProgress?: (finish: number, total: number) => void): Promise<cc.Asset[]> {
        let p = new Promise<cc.Asset[]>((resolve, reject) => {
            cc.resources.loadDir(path, onProgress, (err, assets) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(assets);
                }
            })
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
                    reject(err)
                } else {
                    resolve(asset);
                }
            })
        })
        return p;
    }


    /**
     * 原生平台下载文件到本地
     * @param url 文件下载链接
     */
    static download(url: string) {
        if (!cc.sys.isNative) return;
        let ext = url.substr(url.lastIndexOf("."));
        let p = new Promise<any>((resolve, reject) => {
            cc.assetManager.downloader.download(
                url, url, ext,
                { onFileProgress: null },
                (err, res) => {
                    if (err) {
                        console.error(err);
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
