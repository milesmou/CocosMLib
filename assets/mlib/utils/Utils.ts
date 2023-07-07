/**
 * 常用的一些方法工具类
 */
export class Utils {

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
        if (str1.length == 8 && str2.length == 8) {
            let d1 = new Date(str1.substring(4, 2) + "/" + str1.substring(6, 2) + "/" + str1.substring(0, 4));
            let d2 = new Date(str2.substring(4, 2) + "/" + str2.substring(6, 2) + "/" + str2.substring(0, 4));
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
    static formatCountDownMS(timeMS: number, template: 1 | 2 | 3 | 4, separator = ":") {
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
            str += `${lt10(minutes)}${separator}${lt10(seconds)}`;
        } else if (template == 4) {
            str = hours > 0 ? `${lt10(hours)}时` : "";
            str += `${lt10(minutes)}分${lt10(seconds)}秒`;
        }
        return str;
    }

    /**
     * 返回一个格式化的时间字符串
     * 占位符 YYYY:年 MM:月 DD:日 hh:时 mm:分 ss:秒
     * @param formatStr 格式化的字符串 例 YYYY-MM-DD hh:mm:ss 返回 2022-01-01 12:30:30
     */
    static formatTime(formatStr: string, date?: Date) {
        if (date == undefined) {
            date = new Date();
        }
        let lt10 = v => {
            return v < 10 ? "0" + v : v;
        }
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();
        formatStr = formatStr.replace("YYYY", year.toString());
        formatStr = formatStr.replace("MM", lt10(month).toString());
        formatStr = formatStr.replace("DD", lt10(day).toString());
        formatStr = formatStr.replace("hh", lt10(hour).toString());
        formatStr = formatStr.replace("mm", lt10(minute).toString());
        formatStr = formatStr.replace("ss", lt10(second).toString());
        return formatStr;
    }

    /**
     * 格式化时间戳，返回：XXXX年XX月XX日XX时XX分XX秒
     */
    static formatTime2(times: number) {
        const date = new Date(times);
        let lt10 = v => {
            return v < 10 ? "0" + v : v;
        }
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();
        return `${year}年${lt10(month)}月${lt10(day)}日${lt10(hour)}时${lt10(minute)}分${lt10(second)}秒`;;
    }

    /**
     * 格式化时间戳，返回：XXXX年XX月XX日
     */
    static formatTime3(times: number) {
        const date = new Date(times);
        let lt10 = v => {
            return v < 10 ? "0" + v : v;
        }
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        return `${year}年${lt10(month)}月${lt10(day)}日`;;
    }

    /**
     * 将比较大的数字用K,M,B,T来显示
     * @param fractionDigits 保留小数位数
     * @param canEndWithZero 是否需要用0填补小数位数 默认为false
     */
    static formatNum(value: number, fractionDigits: number, canEndWithZero = false) {
        let prefix = value >= 0 ? "" : "-";
        let v = "";
        let suffix = "";
        value = Math.abs(value);
        if (value >= 0 && value < Math.pow(10, 3)) {
            v = value.toString();
        } else if (value >= Math.pow(10, 3) && value < Math.pow(10, 6)) {
            v = this.fixFloat(value / Math.pow(10, 3), fractionDigits, canEndWithZero);
            suffix = "K";
        } else if (value >= Math.pow(10, 6) && value < Math.pow(10, 9)) {
            v = this.fixFloat(value / Math.pow(10, 6), fractionDigits, canEndWithZero);
            suffix = "M";
        }
        else if (value >= Math.pow(10, 9) && value < Math.pow(10, 12)) {
            v = this.fixFloat(value / Math.pow(10, 9), fractionDigits, canEndWithZero);
            suffix = "B";
        } else {
            v = this.fixFloat(value / Math.pow(10, 12), fractionDigits, canEndWithZero);
            suffix = "T";
        }
        return prefix + v + suffix;
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
    *  修正小数位数
    * @param fractionDigits 保留小数位数
    * @param canEndWithZero 是否需要用0填补小数位数 默认为false
    */
    static fixFloat(value: number, fractionDigits: number, canEndWithZero = false) {
        if (fractionDigits < 0) fractionDigits = 0;
        let str = value.toFixed(fractionDigits);
        if (canEndWithZero) {
            return str;
        } else {
            while (true) {
                if (str.length > 1 && str.includes(".")) {
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

    /// <summary>
    /// 
    /// </summary>
    /// <param name="list">集合</param>
    /// <param name="weight">获取item权重</param>
    /// <param name="num">返回item数量委托</param>
    /// <param name="compare">若需要不重复item,则传入比较两个元素的委托</param>
    /**
     * 从带权重的集合中随机获取指定数量的元素
     * @param list 集合
     * @param weight 获取item权重的方法
     * @param num 返回item数量
     * @param canRepeat item是否可以重复
     * @returns 
     */
    public static randomValueByWeight<T>(list: T[], weight: (item: T) => number, num: number, canRepeat = false) {
        let result: T[] = [];
        if (!list || list.length == 0) return result;
        if (list.length < num) console.warn("需要返回的item数量大于集合长度");

        let count: number = Math.min(list.length, num);
        let totalWeight = 0;

        for (const item of list) {
            totalWeight += weight(item);
        }

        while (result.length < count) {
            let randomV = Math.floor(Math.random() * totalWeight);;
            let tmpWeight = 0;

            for (const item of list) {
                {
                    let w = weight(item);
                    if (randomV >= tmpWeight && randomV < tmpWeight + w) {
                        if (!canRepeat) //检查是否重复元素
                        {
                            var index = result.indexOf(item);
                            if (index == -1) result.push(item);
                            else break;
                        }
                        else {
                            result.push(item);
                        }
                    }

                    tmpWeight += w;
                }
            }

            return result;
        }
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
     * 裁剪前后指定的字符
     */
    static trim(source: string, ...strs: string[]) {
        if (!source) return source;
        if (strs.length == 0) return source.trim();
        for (const str of strs) {
            while (source.startsWith(str)) {
                source = source.substring(str.length);
            }
            while (source.endsWith(str)) {
                source = source.substring(0, source.length - str.length);
            }
        }
        return source;
    }

    static upperFirst(source: string) {
        if (!source) return source;
        if (source.length < 2) return source.toUpperCase();
        return source[0].toUpperCase() + source.substring(1);
    }

    static lowerFirst(source: string) {
        if (!source) return source;
        if (source.length < 2) return source.toLowerCase();
        return source[0].toLowerCase() + source.substring(1);
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
    static countValueTimes<T>(arr: T[], predicate: (value: T) => boolean) {
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
            let r = Math.random() * 16 | 0;
            let v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 随机打乱数组
     * @param arr 
     * @returns 
     */
    static disOriginArr(arr: number[]) {
        let len = arr.length;
        while (len) {
            let index = Math.floor(Math.random() * (len--));
            let temp = arr[index];
            arr[len] = arr[index];
            arr[index] = temp;
        }
        return arr;
    }
}