import { _decorator, Component, Label, RichText, Sprite, Font } from 'cc';
const { ccclass, property } = _decorator;

import { App } from "../App";
import { Utils } from "../utils/Utils";

@ccclass("LanguageText")
class LanguageText {
    @property({
        displayName: "简体"
    })
    zh = "";
    @property({
        displayName: "繁体"
    })
    zh_ft = "";
    @property({
        displayName: "英文"
    })
    english = "";
}

@ccclass("LanguageFont")
class LanguageFont {
    @property({
        type: Font,
        displayName: "简体"
    })
    zh: Font | null = null;
    @property({
        type: Font,
        displayName: "繁体"
    })
    zh_ft: Font | null = null;
    @property({
        type: Font,
        displayName: "英文"
    })
    english: Font | null = null;
}

@ccclass("Language")
export class Language extends Component {
    @property({
        type: LanguageText,
        tooltip: "不同语言显示的内容",
        visible: function () {
            return (this as any).getComponent(Label)
                || (this as any).getComponent(RichText);
        }
    })
    text!: LanguageText;
    @property({
        tooltip: "不同语言使用不同的字体",
        visible: function () {
            return (this as any).getComponent(Label)
                || (this as any).getComponent(RichText);
        }
    })
    useMultipleFont = false;
    @property({
        type: LanguageFont,
        tooltip: "不同语言的字体配置",
        visible: function () {
            return (this as any).useMultipleFont;
        }
    })
    font!: LanguageFont;
    @property({
        tooltip: "图片名字",
        visible: function () {
            return (this as any).getComponent(Sprite);
        }
    })
    spriteName = "";

    private args: any[] | null = null;

    onLoad() {
        this.updateContent();
        Language.list.push(this);
    }

    onDestroy() {
        let index = Language.list.indexOf(this);
        if (index > -1) {
            Language.list.splice(index, 1);
        }
    }

    /** 设置文本参数并刷新内容(针对文本中有动态内容,便于切换语言环境自动刷新内容) */
    setTextArgs(...args: any[]) {
        this.args = args;
        this.updateContent();
    }

    updateContent() {
        let comps: Component[] = this.node["_components"];
        for (let i = 0, len = comps.length; i < len; i++) {
            let comp = comps[i];
            if (comp instanceof Label || comp instanceof RichText) {
                if (this.useMultipleFont) {
                    comp.font = (this.font as any)[App.lang];
                }
                let context = (this.text as any)[App.lang];
                if (this.args) {
                    context = Utils.formatString(context, ...this.args);
                }
                comp.string = context;
                break;
            } else if (comp instanceof Sprite) {
                Language.setSpriteFrameByName(comp, this.spriteName);
                break;
            }
        }
    }

    static list: Language[] = [];
    static dict: { [ID: number]: any } | null = null;
    static init(dict: { [ID: number]: any }) {
        this.dict = this.dict || dict;
    }

    static reload() {
        this.list.forEach(v => {
            v.isValid && v.updateContent();
        });
    }

    static setStringByID(label: Label | RichText, ID: number, ...args: any[]) {
        label.string = this.getStringByID(ID, ...args) || label.string;
    }

    static setSpriteFrameByName(sprite: Sprite, name: string) {
        // Utils.loadSprite(sprite, `language/${app.lang}/${name}`)
    }

    static getStringByID(ID: number, ...args: any[]): string {
        if (!this.dict) {
            console.warn(`未初始化语言表`);
            return "";
        };
        if (!this.dict[ID] || !this.dict[ID][App.lang]) {
            console.warn(`ID=${ID} Lang=${App.lang}  在语言表中无对应内容`);
            return "";
        }
        return Utils.formatString(this.dict[ID][App.lang], ...args);
    }
}

