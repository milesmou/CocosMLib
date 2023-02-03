
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
}