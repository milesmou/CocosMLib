import { sys } from "cc";
import { ELoggerLevel } from "./ELoggerLevel";

const globalTag = "MLogger";
/** 全局日志打印级别 */
let globalLevel: ELoggerLevel;
/** 不打印任何信息的空方法 */
function none(...data) { }
//不同级别日志Title颜色
const debugStyle = `color: #17B6C3; font-weight: bold;`;
const infoStyle = `color: #008000; font-weight: bold;`;
const warnStyle = `color: #FFFF00; font-weight: bold;`;
const errorStyle = `color: #C52B2B; font-weight: bold;`;

class MLogger {

    /** 日子打印级别枚举 */
    public static readonly ELogLevel = ELoggerLevel;

    /** 脚本加载时自动执行 */
    private static init = (() => {
        MLogger.setLevel(ELoggerLevel.Debug);
    })();

    public static new(tag: string, level: ELoggerLevel = ELoggerLevel.Debug) {
        return new MLogger(tag, level);
    }

    public static setLevel(level: ELoggerLevel) {
        globalLevel = level;
        if (sys.isBrowser) {
            this.debug = level > ELoggerLevel.Debug ? none : console.log.bind(console, `%c[${globalTag} Debug]`, debugStyle);
            this.info = level > ELoggerLevel.Info ? none : console.log.bind(console, `%c[${globalTag} Info]`, infoStyle);
            this.warn = level > ELoggerLevel.Warn ? none : console.warn.bind(console, `%c[${globalTag} Warn]`, warnStyle);
            this.error = level > ELoggerLevel.Error ? none : console.error.bind(console, `%c[${globalTag} Error]`, errorStyle);
        } else {
            this.debug = level > ELoggerLevel.Debug ? none : console.log.bind(console, `[${globalTag} Debug]`);
            this.info = level > ELoggerLevel.Info ? none : console.log.bind(console, `[${globalTag} Info]`);
            this.warn = level > ELoggerLevel.Warn ? none : console.warn.bind(console, `[${globalTag} Warn]`,);
            this.error = level > ELoggerLevel.Error ? none : console.error.bind(console, `[${globalTag} Error]`);
        }
    }

    public static debug: (...data) => void;
    public static info: (...data) => void;
    public static warn: (...data) => void;
    public static error: (...data) => void;

    //日志打印对象
    private constructor(tag: string, level: ELoggerLevel = ELoggerLevel.Info) {
        this.debug = globalLevel > ELoggerLevel.Debug || level > ELoggerLevel.Debug ?
            none : console.log.bind(console, `%c[${globalTag} ${tag} Debug]`, debugStyle);
        this.info = globalLevel > ELoggerLevel.Info || level > ELoggerLevel.Info ?
            none : console.log.bind(console, `%c[${globalTag} ${tag} Info]`, infoStyle);
        this.warn = globalLevel > ELoggerLevel.Warn || level > ELoggerLevel.Warn ?
            none : console.warn.bind(console, `%c[${globalTag} ${tag} Warn]`, warnStyle);
        this.error = globalLevel > ELoggerLevel.Error || level > ELoggerLevel.Error ?
            none : console.error.bind(console, `%c[${globalTag} ${tag} Error]`, errorStyle);
    }

    public debug: (...data) => void;
    public info: (...data) => void;
    public warn: (...data) => void;
    public error: (...data) => void;

}

//@ts-ignore
globalThis.mLogger = MLogger;
declare global {
    /** 日志打印类 */
    const mLogger: typeof MLogger;
}