import { BuildHook, IBuildResult, IBuildTaskOption } from '../@types';

import fs from "fs";
import { util } from './util';

const PACKAGE_NAME = 'miles-build-hook';


function log(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

let allAssets = [];

export const throwError: BuildHook.throwError = true;

export const load: BuildHook.load = async function () {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
    allAssets = await Editor.Message.request('asset-db', 'query-assets');
};

export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    util.mkDirIfNotExists("C:/Users/Miles/Desktop/ly证书/onBeforeBuild"+Date.now());
    log(`${PACKAGE_NAME}.webTestOption`, 'onBeforeBuild');
};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    console.debug('get settings test', result.settings);
};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    console.log('webTestOption', 'onAfterCompressSettings');
    
};

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: IBuildTaskOption, result: IBuildResult) {
    // Todo some thing
    console.log("onAfterBuild")
    
};

export const unload: BuildHook.unload = async function () {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
};

export const onError: BuildHook.onError = async function (options, result) {
    // Todo some thing
    console.warn(`${PACKAGE_NAME} run onError`);
};

export const onBeforeMake: BuildHook.onBeforeMake = async function (root, options) {
    console.log(`onBeforeMake: root: ${root}, options: ${options}`);
};

export const onAfterMake: BuildHook.onAfterMake = async function (root, options) {
    console.log(`onAfterMake: root: ${root}, options: ${options}`);
};