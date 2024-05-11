import { Utils } from "./Utils";

export class BigNumberUtil {
    /** 使用A-Z和a-z来格式化显示大数字 */
    public static formatBigNumber(num: number | string | BigNumber) {
        if (typeof num === "number" || typeof num === "string") {
            num = new BigNumber(num);
        }
        let exponent = num.e;
        if (exponent < 4) {//小于10000的直接显示原本数字
            return num.toNumber().toString();
        }
        let n = Math.floor(exponent / 3);
        let mod = exponent % 3;
        let suffix = "";
        if (n <= 26) {//单个大写字母
            suffix = this.getUnitChar(n - 1);
        } else if (n < 26 ** 2) {//两个大写字母
            let u1 = Math.floor(n / 26);
            let u2 = n % 26;
            suffix = this.getUnitChar(u1) + this.getUnitChar(u2);
        } else if (n < 52 ** 2) {//两个字母(包含大小写)
            let u1 = Math.floor(n / 52);
            let u2 = n % 52;
            suffix = this.getUnitChar(u1) + this.getUnitChar(u2);
        } else if (n < 52 ** 3) {//三个字母(包含大小写)
            let u1 = Math.floor(n / (52 ** 2));
            let u2 = Math.floor(n % (52 ** 2) / 52);;
            let u3 = n % 52;
            suffix = this.getUnitChar(u1) + this.getUnitChar(u2) + this.getUnitChar(u3);
        } else {
            return num.toPrecision(3, 1).replace("e+", "E");
        }
        let p = num.toExponential(3, 1);
        let result = parseFloat(p.substring(0, 5));
        if (mod > 0) {
            result *= (10 ** mod);
        }
        return Utils.fixFloat(result, 3) + suffix;

    }


    /** unit范围应该是0-51 分别表示A-Za-z */
    private static getUnitChar(unit: number) {
        if (unit < 0 || unit > 51) {
            console.error("unit的范围应当是0~51 unit=" + unit);
            return "";
        }
        if (unit < 26) {
            return String.fromCharCode(65 + unit);
        } else {
            return String.fromCharCode(71 + unit);
        }
    }
}