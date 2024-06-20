"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLogger = exports.LoggerLevel = void 0;
var LoggerLevel;
(function (LoggerLevel) {
    LoggerLevel[LoggerLevel["Info"] = 0] = "Info";
    LoggerLevel[LoggerLevel["Debug"] = 1] = "Debug";
    LoggerLevel[LoggerLevel["Warn"] = 2] = "Warn";
    LoggerLevel[LoggerLevel["Error"] = 3] = "Error";
})(LoggerLevel = exports.LoggerLevel || (exports.LoggerLevel = {}));
class MLogger {
    static setLevel(level) {
        this.info = level > LoggerLevel.Info ? this.none : console.log.bind(console, `[${this.globalTag} Info]`);
        this.debug = level > LoggerLevel.Debug ? this.none : console.log.bind(console, `[${this.globalTag} Debug]`);
        this.warn = level > LoggerLevel.Warn ? this.none : console.warn.bind(console, `[${this.globalTag} Warn]`);
        this.error = level > LoggerLevel.Error ? this.none : console.error.bind(console, `[${this.globalTag} Error]`);
        this.print = console.log.bind(console, `[${this.globalTag} Print]`);
        this.trace = console.trace.bind(console, `[${this.globalTag} Trace]`);
    }
    static none(...data) { }
    //日志打印对象
    constructor(tag, level = LoggerLevel.Info) {
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
}
exports.MLogger = MLogger;
//默认日志打印
MLogger.globalTag = "Amun-Scene-Tool";
MLogger.setLevel(LoggerLevel.Info);
