import { app } from "../App";
import { Utils } from "../utils/Utils";

const { ccclass, property } = cc._decorator;

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
    en = "";
}

@ccclass("LanguageFont")
class LanguageFont {
    @property({
        type: cc.Font,
        displayName: "简体"
    })
    zh: cc.Font = null;
    @property({
        type: cc.Font,
        displayName: "繁体"
    })
    zh_ft: cc.Font = null;
    @property({
        type: cc.Font,
        displayName: "英文"
    })
    en: cc.Font = null;
}

@ccclass
export default class Language extends cc.Component {
    @property({
        type: LanguageText,
        tooltip: "不同语言显示的内容",
        visible: function () {
            return this.getComponent(cc.Label)
                || this.getComponent(cc.RichText);
        }
    })
    text: LanguageText = null;
    @property({
        tooltip: "不同语言使用不同的字体",
        visible: function () {
            return this.getComponent(cc.Label)
                || this.getComponent(cc.RichText);
        }
    })
    useMultipleFont = false;
    @property({
        type: LanguageFont,
        tooltip: "不同语言的字体配置",
        visible: function () {
            return this.useMultipleFont;
        }
    })
    font: LanguageFont = null;
    @property({
        tooltip: "图片名字",
        visible: function () {
            return this.getComponent(cc.Sprite);
        }
    })
    spriteName = "";

    private args: any[] = null;

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
    setTextArgs(...args) {
        this.args = args;
        this.updateContent();
    }

    updateContent() {
        let comps: cc.Component[] = this.node["_components"];
        for (let i = 0, len = comps.length; i < len; i++) {
            let comp = comps[i];
            if (comp instanceof cc.Label || comp instanceof cc.RichText) {
                if (this.useMultipleFont) {
                    comp.font = this.font[app.lang];
                }
                let context = this.text[app.lang];
                if (this.args) {
                    context = Utils.formatString(context, ...this.args);
                }
                comp.string = context;
                break;
            } else if (comp instanceof cc.Sprite) {
                Language.setSpriteFrameByName(comp, this.spriteName);
                break;
            }
        }
    }

    static list: Language[] = [];
    static dict: { [ID: number]: any } = null;
    static init(dict: { [ID: number]: any }) {
        this.dict = this.dict || dict;
    }

    static reload() {
        this.list.forEach(v => {
            v.isValid && v.updateContent();
        });
    }

    static setStringByID(label: cc.Label | cc.RichText, ID: number, ...args) {
        label.string = this.getStringByID(ID, ...args) || label.string;
    }

    static setSpriteFrameByName(sprite: cc.Sprite, name: string) {
        Utils.loadPicture(sprite, `language/${app.lang}/${name}`)
    }

    static getStringByID(ID: number, ...args): string {
        if (!this.dict) {
            console.warn(`未初始化语言表`);
            return;
        };
        if (!this.dict[ID] || !this.dict[ID][app.lang]) {
            console.warn(`ID=${ID} Lang=${app.lang}  在语言表中无对应内容`);
            return;
        }
        return Utils.formatString(this.dict[ID][app.lang], ...args);
    }
}
