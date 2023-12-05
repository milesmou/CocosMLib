"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
// @ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
const electron = require('electron');
const fs = require('fs-extra');
const path = require('path');
// 用于记录已经改变过主题的窗口URL
let storedWindowUrlArray = [];
// 获得Creator各个窗口
function getAllWebContents() {
    let webContentsArray = [];
    let allwins = electron.BrowserWindow.getAllWindows();
    let currentWindowUrlArray = [];
    for (let i = 0; i < allwins.length; i++) {
        const win = allwins[i];
        currentWindowUrlArray.push(win.webContents.getURL());
    }
    for (let i = 0; i < allwins.length; i++) {
        const win = allwins[i];
        let windowUrl = win.webContents.getURL();
        if (storedWindowUrlArray.indexOf(windowUrl) == -1) {
            webContentsArray.push(win.webContents);
        }
    }
    storedWindowUrlArray = currentWindowUrlArray;
    return webContentsArray;
}
// 执行注入代码
function executeHackCode() {
    let webContentsArray = getAllWebContents();
    let hackCode = fs.readFileSync(path.join(__dirname, '../static/load-hack.js'), 'utf-8');
    let lastWindowTypePlaceholder = 'window/placeholder';
    for (let i = 0; i < webContentsArray.length; i++) {
        hackCode = hackCode.replace(lastWindowTypePlaceholder, webContentsArray[i].getURL());
        lastWindowTypePlaceholder = webContentsArray[i].getURL();
        webContentsArray[i].executeJavaScript(hackCode);
    }
}
/**
 * @en
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    openPanel() {
        Editor.Panel.open(package_json_1.default.name);
    },
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
function load() {
    executeHackCode();
    Editor.Message.addBroadcastListener('cocos-theme:refresh-windows', executeHackCode);
}
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() {
    Editor.Message.broadcast('cocos-theme:remove-listener', []);
    Editor.Message.removeBroadcastListener('cocos-theme:refresh-windows', executeHackCode);
    storedWindowUrlArray = [];
    let webContentsArray = getAllWebContents();
    let hackCode = fs.readFileSync(path.join(__dirname, '../static/unload-hack.js'), 'utf-8');
    for (let i = 0; i < webContentsArray.length; i++) {
        webContentsArray[i].executeJavaScript(hackCode);
    }
}
exports.unload = unload;
