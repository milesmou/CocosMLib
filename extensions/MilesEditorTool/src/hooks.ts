import fs from "fs";
import { BuildHook, IBuildResult, IBuildTaskOption } from '../@types';
import { util } from './util';

const TAG = 'miles-build';
const TemplatePrefix = util.ProjectPath + "/assets/publish/";

function log(...arg: any[]) {
    return console.log(`[${TAG}] `, ...arg);
}

export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    util.mkDirIfNotExists(TemplatePrefix + options.platform);
    appendMBuildLog("Build Start");
};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    appendMBuildLog('get settings test', result.settings);
};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    appendMBuildLog('webTestOption ' + 'onAfterCompressSettings');
};

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    let dir = TemplatePrefix + options.platform;
    appendMBuildLog(options.buildPath);
};

export const onError: BuildHook.onError = async function (options, result) {
    // Todo some thing
    console.warn(`${TAG} run onError`);
};

export const onBeforeMake: BuildHook.onBeforeMake = async function (root, options) {
    appendMBuildLog(`onBeforeMake: root: ${root}, options: ${options}`);
};

export const onAfterMake: BuildHook.onAfterMake = async function (root, options) {
    appendMBuildLog(`onAfterMake: root: ${root}, options: ${options}`);
};

const appendMBuildLog = function (...strs: any[]) {
    let filePath = util.ProjectPath + "/temp/builder/mbuildlog.txt";
    let content = `[${TAG}] ${new Date().toLocaleString()} ${strs.join(" ")} \n`;
    fs.appendFileSync(filePath, content);
}