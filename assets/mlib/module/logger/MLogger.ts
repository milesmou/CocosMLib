import { ELoggerLevel } from "./ELoggerLevel";

const globalTag = "MLogger";
/** 全局日志打印级别 */
let globalLevel: ELoggerLevel;
/** 不打印任何信息的空方法 */
function none(...data) { }
//不同级别日志Title颜色
const infoStyle = `color: #008000; font-weight: bold;`;
const debugStyle = `color: #17B6C3; font-weight: bold;`;
const warnStyle = `color: #FFFF00; font-weight: bold;`;
const errorStyle = `color: #C52B2B; font-weight: bold;`;
const printStyle = `color: #AE63FF; font-weight: bold;`;

class Logger {

    /** 日子打印级别枚举 */
    public static readonly ELogLevel = ELoggerLevel;

    public static new(tag: string, level: ELoggerLevel = ELoggerLevel.Info) {
        return new Logger(tag, level);
    }

    public static setLevel(level: ELoggerLevel) {
        globalLevel = level;
        this.info = level > ELoggerLevel.Info ? none : console.log.bind(console, `%c[${globalTag} Info]`, infoStyle);
        this.debug = level > ELoggerLevel.Debug ? none : console.log.bind(console, `%c[${globalTag} Debug]`, debugStyle);
        this.warn = level > ELoggerLevel.Warn ? none : console.warn.bind(console, `%c[${globalTag} Warn]`, warnStyle);
        this.error = level > ELoggerLevel.Error ? none : console.error.bind(console, `%c[${globalTag} Error]`, errorStyle);
        this.print = console.log.bind(console, `%c[${globalTag} Print]`, printStyle);
    }

    public static info: (...data) => void;

    public static debug: (...data) => void;

    public static warn: (...data) => void;

    public static error: (...data) => void;

    public static print: (...data) => void;

    //日志打印对象
    private constructor(tag: string, level: ELoggerLevel = ELoggerLevel.Info) {
        this.info = globalLevel > ELoggerLevel.Info || level > ELoggerLevel.Info ?
            none : console.log.bind(console, `%c[${globalTag} ${tag} Info]`, infoStyle);
        this.debug = globalLevel > ELoggerLevel.Debug || level > ELoggerLevel.Debug ?
            none : console.log.bind(console, `%c[${globalTag} ${tag} Debug]`, debugStyle);
        this.warn = globalLevel > ELoggerLevel.Warn || level > ELoggerLevel.Warn ?
            none : console.warn.bind(console, `%c[${globalTag} ${tag} Warn]`, warnStyle);
        this.error = globalLevel > ELoggerLevel.Error || level > ELoggerLevel.Error ?
            none : console.error.bind(console, `%c[${globalTag} ${tag} Error]`, errorStyle);
        this.print = console.log.bind(console, `%c[${globalTag} ${tag} Print]`, printStyle);
    }

    public info: (...data) => void;

    public debug: (...data) => void;

    public warn: (...data) => void;

    public error: (...data) => void;

    public print: (...data) => void;
}

Logger.setLevel(ELoggerLevel.Info);

//@ts-ignore
globalThis.mLogger = Logger;

declare global {
    /** 日志打印类 */
    const mLogger: typeof Logger;
}