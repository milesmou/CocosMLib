import { Component, Label, RichText, Sprite, _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { App } from "../App";
import { CCUtils } from '../utils/CCUtil';
import { Utils } from "../utils/Utils";
import { UIBase } from './UIBase';

interface Language {
    sc: string;
    tc: string;
    en: string;
}


@ccclass("Localization")
export class Localization extends Component {
    @property
    key: string = "";

    private ui: UIBase;
    private args: any[] | null = null;

    onLoad() {
        this.ui = CCUtils.getComponentInParent(this.node, UIBase);
        Localization.list.push(this);
        this.refreshContent();
    }

    onDestroy() {
        let index = Localization.list.indexOf(this);
        if (index > -1) {
            Localization.list.splice(index, 1);
        }
    }

    /** 设置文本参数并刷新内容(针对文本中有动态内容,便于切换语言环境自动刷新内容) */
    setTextArgs(...args: any[]) {
        this.args = args;
        this.refreshContent();
    }

    refreshContent() {

    }

    static list: Localization[] = [];
    static dict: { [key: number]: Language } = null;
    static init(dict: { [key: number]: Language }) {
        this.dict = this.dict || dict;
    }

    static reload() {
        this.list.forEach(v => {
            v.isValid && v.refreshContent();
        });
    }

    static setStringByID(label: Label | RichText, key: string, ...args: any[]) {
        label.string = this.getStringByID(key, ...args) || label.string;
    }

    static setSpriteFrameByName(sprite: Sprite, name: string) {
        // Utils.loadSprite(sprite, `language/${app.lang}/${name}`)
    }

    static getStringByID(key: string, ...args: any[]): string {
        if (!this.dict) {
            console.error(`未初始化语言表`);
            return "";
        };
        if (!this.dict[key] || !this.dict[key][App.lang]) {
            console.error(`key=${key} Lang=${App.lang}  在语言表中无对应内容`);
            return "";
        }
        return Utils.formatString(this.dict[key][App.lang], ...args);
    }
}

