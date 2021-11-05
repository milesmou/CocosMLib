/**
 * 常用的一些方法集合
 */
 export class Utils {

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
