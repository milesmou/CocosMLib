import { BuildHook, IBuildResult, IBuildTaskOption } from '../../@cocos/creator-types/editor/packages/builder/@types';
import { Config } from "../tools/Config";
import { Utils } from '../tools/Utils';
import { BuildLogger } from './BuildLogger';
import { BuildConfig } from './postbuild/BuildConfig';
import { BuildNative } from './postbuild/BuildNative';
import { HotUpdate } from './postbuild/HotUpdate';
import { Minigame } from './postbuild/Minigame';

const tag = "[Build]";

export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
};

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: IBuildTaskOption, result: IBuildResult) {
    BuildLogger.info(tag, "后处理开始");
    BuildConfig.execute(options, result);
    if (Utils.isNative(options.platform)) {
        BuildNative.execute(options, result);
        /** 是否启用热更 */
        let hotupdateEnable = Config.get("gameSetting.hotupdate", false);
        BuildLogger.info(tag, 'hotupdateEnable', hotupdateEnable);
        if (hotupdateEnable) {
            HotUpdate.modifyJsFile(options, result);
            HotUpdate.replaceManifest(options, result);
        }
    }
    if (Utils.isMinigame(options.platform)) {
        if (!options.md5Cache) {
            BuildLogger.error(tag, "小游戏请开启Md5Cache");
        }
        await Minigame.modifyServer(options, result);
        await Minigame.uploadToAliOss(options, result);
    }
    BuildLogger.info(tag, "后处理结束");
};

export const onError: BuildHook.onError = async function (options, result) {
    // Todo some thing
};

export const onBeforeMake: BuildHook.onBeforeMake = async function (root, options) {
    // Todo some thing
};

export const onAfterMake: BuildHook.onAfterMake = async function (root, options) {
    // Todo some thing
};

