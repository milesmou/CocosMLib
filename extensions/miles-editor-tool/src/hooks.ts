import { BuildHook, IBuildResult, IBuildTaskOption } from '../@types';
import { MLogger } from "./tools/MLogger";


export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
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
    

};

export const onError: BuildHook.onError = async function (options, result) {
    // Todo some thing
    MLogger.debug("run onError");
};

export const onBeforeMake: BuildHook.onBeforeMake = async function (root, options) {
    MLogger.debug(`onBeforeMake: root: ${root}, options: ${options}`);
};

export const onAfterMake: BuildHook.onAfterMake = async function (root, options) {
    MLogger.debug(`onAfterMake: root: ${root}, options: ${options}`);
};
