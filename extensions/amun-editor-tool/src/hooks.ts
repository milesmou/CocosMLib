import { BuildHook, IBuildResult, IBuildTaskOption } from '../@types';
import { BuildTemplate } from './postbuild/BuildTemplate';
import { HotUpdate } from './postbuild/HotUpdate';
import { Minigame } from './postbuild/Minigame';
import { Logger } from './tools/Logger';
import { Utils } from './tools/Utils';


export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    Logger.info("onBeforeBuild");
};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    Logger.info('onBeforeCompressSettings');
};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    Logger.info('onAfterCompressSettings');
};

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: IBuildTaskOption, result: IBuildResult) {
    Logger.info("onAfterBuild");
    BuildTemplate.copy(options, result);
    if (Utils.isNative(options.platform)) {
        HotUpdate.modifyJsFile(options, result);
        HotUpdate.replaceManifest(options, result);
    }
    Minigame.modifyServer(options, result);
};

export const onError: BuildHook.onError = async function (options, result) {
    // Todo some thing
    Logger.info("run onError");
};

export const onBeforeMake: BuildHook.onBeforeMake = async function (root, options) {
    Logger.info(`onBeforeMake: root: ${root}, options: ${options}`);
};

export const onAfterMake: BuildHook.onAfterMake = async function (root, options) {
    Logger.info(`onAfterMake: root: ${root}, options: ${options}`);
};
