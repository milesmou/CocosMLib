"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAfterMake = exports.onBeforeMake = exports.onError = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = void 0;
const BuildTemplate_1 = require("./postbuild/BuildTemplate");
const HotUpdate_1 = require("./postbuild/HotUpdate");
const Minigame_1 = require("./postbuild/Minigame");
const Logger_1 = require("./tools/Logger");
const Utils_1 = require("./tools/Utils");
const onBeforeBuild = async function (options, result) {
    // Todo some thing
    Logger_1.Logger.info("onBeforeBuild");
};
exports.onBeforeBuild = onBeforeBuild;
const onBeforeCompressSettings = async function (options, result) {
    // Todo some thing
    Logger_1.Logger.info('onBeforeCompressSettings');
};
exports.onBeforeCompressSettings = onBeforeCompressSettings;
const onAfterCompressSettings = async function (options, result) {
    // Todo some thing
    Logger_1.Logger.info('onAfterCompressSettings');
};
exports.onAfterCompressSettings = onAfterCompressSettings;
const onAfterBuild = async function (options, result) {
    Logger_1.Logger.info("onAfterBuild");
    BuildTemplate_1.BuildTemplate.copy(options, result);
    if (Utils_1.Utils.isNative(options.platform)) {
        HotUpdate_1.HotUpdate.modifyJsFile(options, result);
        HotUpdate_1.HotUpdate.replaceManifest(options, result);
    }
    Minigame_1.Minigame.modifyServer(options, result);
};
exports.onAfterBuild = onAfterBuild;
const onError = async function (options, result) {
    // Todo some thing
    Logger_1.Logger.info("run onError");
};
exports.onError = onError;
const onBeforeMake = async function (root, options) {
    Logger_1.Logger.info(`onBeforeMake: root: ${root}, options: ${options}`);
};
exports.onBeforeMake = onBeforeMake;
const onAfterMake = async function (root, options) {
    Logger_1.Logger.info(`onAfterMake: root: ${root}, options: ${options}`);
};
exports.onAfterMake = onAfterMake;
