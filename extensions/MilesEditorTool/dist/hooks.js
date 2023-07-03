"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAfterMake = exports.onBeforeMake = exports.onError = exports.unload = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = exports.load = exports.throwError = void 0;
const util_1 = require("./util");
const PACKAGE_NAME = 'miles-build-hook';
function log(...arg) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}
let allAssets = [];
exports.throwError = true;
const load = async function () {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
    allAssets = await Editor.Message.request('asset-db', 'query-assets');
};
exports.load = load;
const onBeforeBuild = async function (options, result) {
    // Todo some thing
    util_1.util.mkDirIfNotExists("C:/Users/Miles/Desktop/ly证书/onBeforeBuild" + Date.now());
    log(`${PACKAGE_NAME}.webTestOption`, 'onBeforeBuild');
};
exports.onBeforeBuild = onBeforeBuild;
const onBeforeCompressSettings = async function (options, result) {
    // Todo some thing
    console.debug('get settings test', result.settings);
};
exports.onBeforeCompressSettings = onBeforeCompressSettings;
const onAfterCompressSettings = async function (options, result) {
    // Todo some thing
    console.log('webTestOption', 'onAfterCompressSettings');
};
exports.onAfterCompressSettings = onAfterCompressSettings;
const onAfterBuild = async function (options, result) {
    // Todo some thing
    console.log("onAfterBuild");
};
exports.onAfterBuild = onAfterBuild;
const unload = async function () {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
};
exports.unload = unload;
const onError = async function (options, result) {
    // Todo some thing
    console.warn(`${PACKAGE_NAME} run onError`);
};
exports.onError = onError;
const onBeforeMake = async function (root, options) {
    console.log(`onBeforeMake: root: ${root}, options: ${options}`);
};
exports.onBeforeMake = onBeforeMake;
const onAfterMake = async function (root, options) {
    console.log(`onAfterMake: root: ${root}, options: ${options}`);
};
exports.onAfterMake = onAfterMake;
