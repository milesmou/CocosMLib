"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAfterMake = exports.onBeforeMake = exports.onError = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const Utils_1 = require("./tools/Utils");
const MLogger_1 = require("./tools/MLogger");
const TAG = 'miles-build';
const TemplatePrefix = Utils_1.Utils.ProjectPath + "/assets/publish/";
function log(...arg) {
    return console.log(`[${TAG}] `, ...arg);
}
const onBeforeBuild = async function (options, result) {
    // Todo some thing
    fs_extra_1.default.emptyDirSync(TemplatePrefix + options.platform);
    MLogger_1.MLogger.debug("Build Start");
};
exports.onBeforeBuild = onBeforeBuild;
const onBeforeCompressSettings = async function (options, result) {
    // Todo some thing
    MLogger_1.MLogger.debug('get settings test', result.settings);
};
exports.onBeforeCompressSettings = onBeforeCompressSettings;
const onAfterCompressSettings = async function (options, result) {
    // Todo some thing
    MLogger_1.MLogger.debug('webTestOption ' + 'onAfterCompressSettings');
};
exports.onAfterCompressSettings = onAfterCompressSettings;
const onAfterBuild = async function (options, result) {
    MLogger_1.MLogger.debug("onAfterBuild");
    let templatePath = TemplatePrefix + options.platform;
    let buildPath = Utils_1.Utils.toUniSeparator(result.dest);
    let files = Utils_1.Utils.getAllFiles(templatePath);
    for (const file of files) {
        let newFile = buildPath + file.replace(templatePath, "");
        fs_extra_1.default.emptyDirSync(path_1.default.dirname(newFile));
        fs_extra_1.default.copyFileSync(file, Utils_1.Utils.fixupFilePath(newFile));
        appendMBuildLog(`copy ${file} to ${newFile}`);
    }
};
exports.onAfterBuild = onAfterBuild;
const onError = async function (options, result) {
    // Todo some thing
    console.warn(`${TAG} run onError`);
};
exports.onError = onError;
const onBeforeMake = async function (root, options) {
    appendMBuildLog(`onBeforeMake: root: ${root}, options: ${options}`);
};
exports.onBeforeMake = onBeforeMake;
const onAfterMake = async function (root, options) {
    appendMBuildLog(`onAfterMake: root: ${root}, options: ${options}`);
};
exports.onAfterMake = onAfterMake;
const appendMBuildLog = function (...strs) {
    let filePath = Utils_1.Utils.ProjectPath + "/temp/builder/mbuildlog.txt";
    let content = `[${TAG}] ${new Date().toLocaleString()} ${strs.join(" ")} \n`;
    fs_extra_1.default.appendFileSync(filePath, content);
};
