import fs from "fs-extra";
import path from "path";
import { BuildHook, IBuildResult, IBuildTaskOption } from '../@types';
import { Utils } from './tools/Utils';
import { MLogger } from "./tools/MLogger";

const TAG = 'miles-build';
const TemplatePrefix = Utils.ProjectPath + "/assets/publish/";

function log(...arg: any[]) {
    return console.log(`[${TAG}] `, ...arg);
}

export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    fs.emptyDirSync(TemplatePrefix + options.platform);
    MLogger.debug("Build Start");

};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    MLogger.debug('get settings test', result.settings);
};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    MLogger.debug('webTestOption ' + 'onAfterCompressSettings');
};

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: IBuildTaskOption, result: IBuildResult) {
    MLogger.debug("onAfterBuild");
    let templatePath = TemplatePrefix + options.platform;
    let buildPath = Utils.toUniSeparator(result.dest);
    let files = Utils.getAllFiles(templatePath);
    for (const file of files) {
        let newFile = buildPath + file.replace(templatePath, "");
        fs.emptyDirSync(path.dirname(newFile));
        fs.copyFileSync(file, Utils.fixupFilePath(newFile));
        appendMBuildLog(`copy ${file} to ${newFile}`);
    }
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
    let filePath = Utils.ProjectPath + "/temp/builder/mbuildlog.txt";
    let content = `[${TAG}] ${new Date().toLocaleString()} ${strs.join(" ")} \n`;
    fs.appendFileSync(filePath, content);
}