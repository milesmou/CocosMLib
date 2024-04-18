import { BuildHook, IBuildResult, IBuildTaskOption } from '../@types';
import { BuildTemplate } from './postbuild/BuildTemplate';
import { HotUpdate } from './postbuild/HotUpdate';
import { Minigame } from './postbuild/Minigame';
import { Config } from './tools/Config';
import { LogToFile } from './tools/LogToFile';
import { Utils } from './tools/Utils';


export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    LogToFile.log("onBeforeBuild");
};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    LogToFile.log('onBeforeCompressSettings');
};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    LogToFile.log('onAfterCompressSettings');
};

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: IBuildTaskOption, result: IBuildResult) {
    LogToFile.log("onAfterBuild");
    BuildTemplate.copy(options, result);
    HotUpdate.modifyJsFile(options, result);
    Minigame.modifyServer(options,result);
};

export const onError: BuildHook.onError = async function (options, result) {
    // Todo some thing
    LogToFile.log("run onError");
};

export const onBeforeMake: BuildHook.onBeforeMake = async function (root, options) {
    LogToFile.log(`onBeforeMake: root: ${root}, options: ${options}`);
};

export const onAfterMake: BuildHook.onAfterMake = async function (root, options) {
    LogToFile.log(`onAfterMake: root: ${root}, options: ${options}`);
};
