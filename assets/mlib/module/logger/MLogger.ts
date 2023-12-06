
export enum ELoggerLevel {
    Info, Debug, Warn, Error
}

export class MLogger {

    //默认日志打印
    private static globalTag = "MLogger";
    private static globalLevel: ELoggerLevel;

    public static setLevel(level: ELoggerLevel) {
        MLogger.globalLevel = level;
        this.info = level > ELoggerLevel.Info ? this.none : console.log.bind(console, `[${this.globalTag} Info]`);
        this.debug = level > ELoggerLevel.Debug ? this.none : console.log.bind(console, `[${this.globalTag} Debug]`);
        this.warn = level > ELoggerLevel.Warn ? this.none : console.warn.bind(console, `[${this.globalTag} Warn]`);
        this.error = level > ELoggerLevel.Error ? this.none : console.error.bind(console, `[${this.globalTag} Error]`);
        this.print = console.log.bind(console, `[${this.globalTag} Print]`);
        this.trace = console.trace.bind(console, `[${this.globalTag} Trace]`);
    }

    public static info: (...data) => void;

    public static debug: (...data) => void;

    public static warn: (...data) => void;

    public static error: (...data) => void;

    public static print: (...data) => void;

    public static trace: (...data) => void;

    private static none(...data) { }

    //日志打印对象
    constructor(tag: string, level: ELoggerLevel = ELoggerLevel.Info) {
        this.info = MLogger.globalLevel > ELoggerLevel.Info || level > ELoggerLevel.Info ? MLogger.none :
            console.log.bind(console, `[${MLogger.globalTag} ${tag} Info]`);
        this.debug = MLogger.globalLevel > ELoggerLevel.Debug || level > ELoggerLevel.Debug ? MLogger.none :
            console.log.bind(console, `[${MLogger.globalTag} ${tag} Debug]`);
        this.warn = MLogger.globalLevel > ELoggerLevel.Warn || level > ELoggerLevel.Warn ? MLogger.none :
            console.warn.bind(console, `[${MLogger.globalTag} ${tag} Warn]`);
        this.error = MLogger.globalLevel > ELoggerLevel.Error || level > ELoggerLevel.Error ? MLogger.none :
            console.error.bind(console, `[${MLogger.globalTag} ${tag} Error]`);
        this.print = console.log.bind(console, `[${MLogger.globalTag} ${tag} Print]`);
        this.trace = console.trace.bind(console, `[${MLogger.globalTag} ${tag} Trace]`);
    }

    public info: (...data) => void;

    public debug: (...data) => void;

    public warn: (...data) => void;

    public error: (...data) => void;

    public print: (...data) => void;

    public trace: (...data) => void;
}

MLogger.setLevel(ELoggerLevel.Info);
