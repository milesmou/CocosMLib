
export enum LoggerLevel {
    Info, Debug, Warn, Error
}

export class MLogger {

    //默认日志打印
    private static globalTag = "MLogger";
    private static globalLevel: LoggerLevel;

    public static setLevel(level: LoggerLevel) {
        this.info = level > LoggerLevel.Info ? this.none : console.log.bind(console, `[${this.globalTag} Info]`);
        this.debug = level > LoggerLevel.Debug ? this.none : console.log.bind(console, `[${this.globalTag} Debug]`);
        this.warn = level > LoggerLevel.Warn ? this.none : console.warn.bind(console, `[${this.globalTag} Warn]`);
        this.error = level > LoggerLevel.Error ? this.none : console.error.bind(console, `[${this.globalTag} Error]`);
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
    constructor(tag: string, level: LoggerLevel = LoggerLevel.Info) {
        this.info = MLogger.globalLevel > LoggerLevel.Info || level > LoggerLevel.Info ? MLogger.none :
            console.log.bind(console, `[${MLogger.globalTag} ${tag} Info]`);
        this.debug = MLogger.globalLevel > LoggerLevel.Debug || level > LoggerLevel.Debug ? MLogger.none :
            console.log.bind(console, `[${MLogger.globalTag} ${tag} Debug]`);
        this.warn = MLogger.globalLevel > LoggerLevel.Warn || level > LoggerLevel.Warn ? MLogger.none :
            console.warn.bind(console, `[${MLogger.globalTag} ${tag} Warn]`);
        this.error = MLogger.globalLevel > LoggerLevel.Error || level > LoggerLevel.Error ? MLogger.none :
            console.error.bind(console, `[${MLogger.globalTag} ${tag} Error]`);
        this.print = console.log.bind(console, `[${MLogger.globalTag} ${tag} Print]`);
        this.trace = console.log.bind(console, `[${MLogger.globalTag} ${tag} Trace]`);
    }

    public info: (...data) => void;

    public debug: (...data) => void;

    public warn: (...data) => void;

    public error: (...data) => void;

    public print: (...data) => void;

    public trace: (...data) => void;
}

MLogger.setLevel(LoggerLevel.Info);
