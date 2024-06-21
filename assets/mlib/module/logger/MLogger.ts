import { ELoggerLevel } from "./ELoggerLevel";

export class MLogger {

    //默认日志打印
    private static globalTag = "MLogger";
    private static globalLevel: ELoggerLevel;

    public static new(tag: string, level: ELoggerLevel = ELoggerLevel.Info) {
        return new MLogger(tag, level);
    }

    public static setLevel(level: ELoggerLevel) {
        this.info = level > ELoggerLevel.Info ? this.none : console.log.bind(console, `[${this.globalTag} Info]`);
        this.debug = level > ELoggerLevel.Debug ? this.none : console.log.bind(console, `[${this.globalTag} Debug]`);
        this.warn = level > ELoggerLevel.Warn ? this.none : console.warn.bind(console, `[${this.globalTag} Warn]`);
        this.error = level > ELoggerLevel.Error ? this.none : console.error.bind(console, `[${this.globalTag} Error]`);
        this.print = console.log.bind(console, `[${this.globalTag} Print]`);
        this.trace = console.trace ? console.trace.bind(console, `[${this.globalTag} Trace]`) :
            console.log.bind(console, `[${this.globalTag} Not Support Trace]`);
    }

    public static info: (...data) => void;

    public static debug: (...data) => void;

    public static warn: (...data) => void;

    public static error: (...data) => void;

    public static print: (...data) => void;

    public static trace: (...data) => void;

    private static none(...data) { }

    //日志打印对象
    private constructor(tag: string, level: ELoggerLevel = ELoggerLevel.Info) {
        this.info = logger.globalLevel > ELoggerLevel.Info || level > ELoggerLevel.Info ? logger.none :
            console.log.bind(console, `[${logger.globalTag} ${tag} Info]`);
        this.debug = logger.globalLevel > ELoggerLevel.Debug || level > ELoggerLevel.Debug ? logger.none :
            console.log.bind(console, `[${logger.globalTag} ${tag} Debug]`);
        this.warn = logger.globalLevel > ELoggerLevel.Warn || level > ELoggerLevel.Warn ? logger.none :
            console.warn.bind(console, `[${logger.globalTag} ${tag} Warn]`);
        this.error = logger.globalLevel > ELoggerLevel.Error || level > ELoggerLevel.Error ? logger.none :
            console.error.bind(console, `[${logger.globalTag} ${tag} Error]`);
        this.print = console.log.bind(console, `[${logger.globalTag} ${tag} Print]`);
        this.trace = console.trace ? console.trace.bind(console, `[${logger.globalTag} Trace]`) :
            console.log.bind(console, `[${logger.globalTag} NoTrace]`);
    }

    public info: (...data) => void;

    public debug: (...data) => void;

    public warn: (...data) => void;

    public error: (...data) => void;

    public print: (...data) => void;

    public trace: (...data) => void;
}

MLogger.setLevel(ELoggerLevel.Info);