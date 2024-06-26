
/**
 * 常用的一些方法工具类
 */
export class Utils {

    /** 获取日期(格式:20220101) 默认获取当天日期 */
    public static getDate(timeMS?: number) {
        let lt10 = (v: number) => {
            return v < 10 ? "0" + v : v.toString();
        }
        let date = timeMS >= 0 ? new Date(timeMS) : new Date();
        let str = date.getFullYear() + lt10(date.getMonth() + 1) + lt10(date.getDate());
        return parseInt(str);
    }

    /**
     * 计算两个日期的天数差 日期格式20200101
     */
    public static deltaDay(date1: number, date2: number) {
        let d1 = new Date();
        d1.setFullYear(Math.floor(date1 / 10000), Math.floor(date1 % 10000 / 100) - 1, date1 % 100);
        d1.setHours(0, 0, 0, 0);
        let d2 = new Date();
        d2.setFullYear(Math.floor(date2 / 10000), Math.floor(date2 % 10000 / 100) - 1, date2 % 100);
        d2.setHours(0, 0, 0, 0);
        let days = Math.abs(d1.getTime() - d2.getTime()) / (24 * 60 * 60 * 1000);
        return Math.floor(days);
    }

    /**
    * 将剩余时间(毫秒)转化为时分秒格式
    * @param timeMS 倒计时的时间
    * @param format hh:时 mm:分 ss:秒
    * @returns 格式化的字符串 hh:mm:ss 返回 00:30:30
    */
    public static formatCountdown(timeMS: number, format: string) {
        let lt10 = (v: number) => {
            return v < 10 ? "0" + v : v.toString();
        }
        timeMS = Math.floor(timeMS / 1000);
        let hours = Math.floor(timeMS / 3600);
        let minutes = Math.floor((timeMS - hours * 3600) / 60);
        let seconds = timeMS - hours * 3600 - minutes * 60;
        format = format.replace("hh", lt10(hours));
        format = format.replace("mm", lt10(minutes));
        format = format.replace("ss", lt10(seconds));
        return format;
    }


    /**
     * 返回一个格式化的时间字符串
     * @param format 占位符 YYYY:年 MM:月 DD:日 hh:时 mm:分 ss:秒
     * @returns 格式化的字符串 例 YYYY-MM-DD hh:mm:ss 返回 2022-01-01 12:30:30
     */
    public static formatTime(format: string, date?: Date) {
        if (date == undefined) {
            date = new Date();
        }
        let lt10 = (v: number) => {
            return v < 10 ? "0" + v : v.toString();
        }
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();
        format = format.replace("YYYY", year.toString());
        format = format.replace("MM", lt10(month));
        format = format.replace("DD", lt10(day));
        format = format.replace("hh", lt10(hour));
        format = format.replace("mm", lt10(minute));
        format = format.replace("ss", lt10(second));
        return format;
    }

    /** 筛选出字符串中所有数字(0-9) 然后转化为整数 */
    public static string2Number(str: string) {
        if (!str) return -1;
        str = str.replace(/[^0-9]/g, "");
        let num = parseInt(str);
        return num;
    }

    /**
     * 将比较大的数字格式化显示 英文后缀
     * @param fractionDigits 保留小数位数
     * @param canEndWithZero 是否需要用0填补小数位数 默认为false
     */
    public static formatNum(value: number, fractionDigits: number, canEndWithZero = false) {
        //每个单位间相差10的3次方倍
        let arr = [
            "", "K", "M", "B", "T"
        ]

        let result = "";


        if (value == 0) {
            return "0";
        }

        if (value < 0) {
            result += "-";
            value = -value;
        }

        let exponent = 3;

        for (let i = 0; i < arr.length; i++) {
            const v = arr[i];
            if (value >= Math.pow(10, exponent * i)) {
                if (value < Math.pow(10, exponent * (i + 1)) || i == arr.length - 1) {
                    result += (Utils.fixFloat(value / Math.pow(10, exponent * i), fractionDigits, canEndWithZero) + v);
                    break;
                }
            }
        }

        return result;
    }

    /**
     * 将比较大的数字格式化显示 中文后缀
     * @param fractionDigits 保留小数位数
     * @param canEndWithZero 是否需要用0填补小数位数 默认为false
     */
    public static formatNumCN(value: number, fractionDigits: number, canEndWithZero = false) {
        //每个单位间相差10的4次方倍
        let arr = [
            "", "万", "亿", "万亿", "兆", "万兆", "京", "万京", "垓", "万垓", "秭", "万秭",
            "壤", "万壤", "沟", "万沟", "涧", "万涧", "正", "万正", "载", "万载", "极", "万极"
        ]

        let result = "";


        if (value == 0) {
            return "0";
        }

        if (value < 0) {
            result += "-";
            value = -value;
        }

        let exponent = 4;

        for (let i = 0; i < arr.length; i++) {
            const v = arr[i];
            if (value >= Math.pow(10, exponent * i)) {
                if (value < Math.pow(10, exponent * (i + 1)) || i == arr.length - 1) {
                    result += (Utils.fixFloat(value / Math.pow(10, exponent * i), fractionDigits, canEndWithZero) + v);
                    break;
                }
            }
        }

        return result;
    }

    /** 分割字符串为number数组 默认分隔符(,) */
    public static splitString(str: string, sep = ","): number[] {
        let arr: number[] = [];
        let sArr = str.trim().split(sep);
        for (const s of sArr) {
            let v = parseFloat(s);
            if (!isNaN(v)) arr.push(v);
        }
        return arr;
    }

    /** 分割字符串为二维number数组 默认分隔符1(;) 默认分隔符2(,) */
    public static splitStrings(strs: string, sep1 = ";", sep2 = ","): number[][] {
        let arr: number[][] = [];
        let sArr = strs.trim().split(sep1);
        for (const s of sArr) {
            if (s.trim()) {
                arr.push(this.splitString(s, sep2));
            }
        }
        return arr;
    }

    /**
     * 获取一个随机数，区间[min,max]
     * @param min 最小值
     * @param max 最大值
     * @param isInteger 是否是整数 默认true
     */
    public static randomNum(min: number, max: number, isInteger = true) {
        let delta = max - min;
        let value = Math.random() * delta + min;
        if (isInteger) {
            value = Math.round(value);
        }
        return value;
    }

    /**
    * 获取一些随机整数，区间[min,max]
    * @param min 最小值
    * @param max 最大值
    * @param num 数量
    */
    public static randomNums(min: number, max: number, num: number, canRepeat = false) {
        let result: number[] = [];
        num = Math.min(num, max - min + 1);
        let delta = max - min;
        while (result.length < num) {
            let value = Math.round(Math.random() * delta + min);
            if (canRepeat) {
                result.push(value);
            } else if (!result.includes(value)) {
                result.push(value);
            }
        }
        return result;
    }

    /**
    *  修正小数位数
    * @param fractionDigits 保留小数位数
    * @param canEndWithZero 是否需要用0填补小数位数 默认为false
    */
    public static fixFloat(value: number, fractionDigits: number, canEndWithZero = false) {
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

    /** 从list中随机出一个值 */
    public static randomOneValue<T>(list: T[], weight?: (item: T) => number) {
        let arr = this.randomValueByWeight(list, 1, weight);
        if (arr.length > 0) return arr[0];
        return null;
    }

    /**
     * 从带权重的集合中随机获取指定数量的元素
     * @param list 集合
     * @param weight 获取item权重的方法
     * @param num 返回item数量
     * @param canRepeat item是否可以重复
     * @returns 
     */
    public static randomValueByWeight<T>(list: T[], num = 1, weight?: (item: T) => number, canRepeat = false) {
        let result: T[] = [];
        if (!weight) weight = (item: T) => 1;
        list = list.filter(v => weight(v) > 0)//排除0权重的元素
        if (!list || list.length == 0) return result;
        if (!canRepeat) {
            if (list.length < num) console.warn("需要返回的item数量大于集合长度");
            num = Math.min(list.length, num);
        }
        let accumulatedWeightList: number[] = [];//保存每个元素的累计权重
        let totalWeight = 0;

        for (let i = 0; i < list.length; i++) {
            let w = weight(list[i]);
            totalWeight += w;
            accumulatedWeightList[i] = totalWeight;
        }

        while (result.length < num) {
            let randomW = Math.floor(Math.random() * totalWeight);
            for (let i = 0; i < list.length; i++) {
                let w = accumulatedWeightList[i];
                if (randomW < w) {
                    const item = list[i];
                    if (!canRepeat) //检查是否重复元素
                    {
                        if (!result.includes(item)) result.push(item);
                    }
                    else {
                        result.push(item);
                    }
                    break;
                }
            }
        }
        return result;
    }
    /**
     * 格式化字符串,用args的内容替换str中的{i},i从0开始
     */
    public static formatString(str: string, ...args: any[]) {
        args.forEach((v, i) => {
            str = str.replace(`{${i}}`, v);
        });
        return str;
    }

    /**
     * 裁剪前后指定的字符
     */
    public static trim(source: string, ...strs: string[]) {
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

    /** 从集合中获取一个元素的位置 */
    public static getItemPosInList(space: number, index: number, length: number, origin: "center" | "left" = "center") {
        if (origin == "center") {
            return space * (index - length / 2 + 0.5);
        } else {
            return space * index;
        }
    }

    /** 统计元素在数组中出现次数 */
    public static countValueTimes<T>(arr: T[], predicate: (value: T) => boolean) {
        let times = 0;
        arr.forEach(v => {
            if (predicate(v)) {
                times++;
            }
        })
        return times;
    }

    /** 生成UUID */
    public static genUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0;
            let v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }


    // ==============================================================================================================================


    /** 从数组删除元素 */
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

    /** 当日24时的时间戳：单位秒 */
    static getDay24TimeMS() {
        return Math.round(+new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1) / 1000);
    }

    /**获得秒差，需要传入一个时间戳，和现在作对比,返回的单位是秒 */
    static getDurationSecond(time: number) {
        return this.getNowTime() - time;
    }

    /**获取当前的时间戳：单位秒 */
    static getNowTime() {
        return Math.round(new Date().getTime() / 1000);
    }
}