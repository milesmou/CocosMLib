"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAfterMake = exports.onBeforeMake = exports.onError = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = void 0;
const BuildTemplate_1 = require("./postbuild/BuildTemplate");
const HotUpdate_1 = require("./postbuild/HotUpdate");
const LogToFile_1 = require("./tools/LogToFile");
const onBeforeBuild = async function (options, result) {
    // Todo some thing
    LogToFile_1.LogToFile.log("Build Start");
};
exports.onBeforeBuild = onBeforeBuild;
const onBeforeCompressSettings = async function (options, result) {
    // Todo some thing
    LogToFile_1.LogToFile.log('get settings test', result.settings);
};
exports.onBeforeCompressSettings = onBeforeCompressSettings;
const onAfterCompressSettings = async function (options, result) {
    // Todo some thing
    LogToFile_1.LogToFile.log('webTestOption ' + 'onAfterCompressSettings');
};
exports.onAfterCompressSettings = onAfterCompressSettings;
const onAfterBuild = async function (options, result) {
    LogToFile_1.LogToFile.log("onAfterBuild");
    BuildTemplate_1.BuildTemplate.copy(options, result);
    HotUpdate_1.HotUpdate.modifyMainJs(options, result);
};
exports.onAfterBuild = onAfterBuild;
const onError = async function (options, result) {
    // Todo some thing
    LogToFile_1.LogToFile.log("run onError");
};
exports.onError = onError;
const onBeforeMake = async function (root, options) {
    LogToFile_1.LogToFile.log(`onBeforeMake: root: ${root}, options: ${options}`);
};
exports.onBeforeMake = onBeforeMake;
const onAfterMake = async function (root, options) {
    LogToFile_1.LogToFile.log(`onAfterMake: root: ${root}, options: ${options}`);
};
exports.onAfterMake = onAfterMake;
