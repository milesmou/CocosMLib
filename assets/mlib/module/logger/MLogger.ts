import { ELoggerLevel } from "./ELoggerLevel";

const globalTag = "MLogger";
/** 全局日志打印级别 */
let globalLevel: ELoggerLevel;
/** 不打印任何信息的空方法 */
function none(...data) { }

class MLogger {

    /** 日子打印级别枚举 */
    public static readonly ELogLevel = ELoggerLevel;

    public static new(tag: string, level: ELoggerLevel = ELoggerLevel.Info) {
        return new MLogger(tag, level);
    }

    public static setLevel(level: ELoggerLevel) {
        globalLevel = level;
        this.info = level > ELoggerLevel.Info ? none : console.log.bind(console, `[${globalTag} Info]`);
        this.debug = level > ELoggerLevel.Debug ? none : console.log.bind(console, `[${globalTag} Debug]`);
        this.warn = level > ELoggerLevel.Warn ? none : console.warn.bind(console, `[${globalTag} Warn]`);
        this.error = level > ELoggerLevel.Error ? none : console.error.bind(console, `[${globalTag} Error]`);
        this.print = console.log.bind(console, `[${globalTag} Print]`);
        this.trace = console.trace ? console.trace.bind(console, `[${globalTag} Trace]`) :
            console.log.bind(console, `[${globalTag} Not Support Trace]`);
    }

    public static info: (...data) => void;

    public static debug: (...data) => void;

    public static warn: (...data) => void;

    public static error: (...data) => void;

    public static print: (...data) => void;

    public static trace: (...data) => void;

    //日志打印对象
    private constructor(tag: string, level: ELoggerLevel = ELoggerLevel.Info) {
        this.info = globalLevel > ELoggerLevel.Info || level > ELoggerLevel.Info ?
            none : console.log.bind(console, `[${globalTag} ${tag} Info]`);
        this.debug = globalLevel > ELoggerLevel.Debug || level > ELoggerLevel.Debug ?
            none : console.log.bind(console, `[${globalTag} ${tag} Debug]`);
        this.warn = globalLevel > ELoggerLevel.Warn || level > ELoggerLevel.Warn ?
            none : console.warn.bind(console, `[${globalTag} ${tag} Warn]`);
        this.error = globalLevel > ELoggerLevel.Error || level > ELoggerLevel.Error ?
            none : console.error.bind(console, `[${globalTag} ${tag} Error]`);
        this.print = console.log.bind(console, `[${globalTag} ${tag} Print]`);
        this.trace = console.trace ? console.trace.bind(console, `[${globalTag} Trace]`) :
            console.log.bind(console, `[${globalTag} Not Support Trace]`);
    }

    public info: (...data) => void;

    public debug: (...data) => void;

    public warn: (...data) => void;

    public error: (...data) => void;

    public print: (...data) => void;

    public trace: (...data) => void;
}

MLogger.setLevel(ELoggerLevel.Info);

//@ts-ignore
globalThis["logger"] = MLogger;

declare global {
    /** 日志打印类 */
    const logger: typeof MLogger;
}