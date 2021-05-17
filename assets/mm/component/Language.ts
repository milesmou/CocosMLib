import { app } from "../App";
import { Utils } from "../utils/Utils";

const { ccclass, property } = cc._decorator;

const EMode = cc.Enum({
    ID: 0,
    Manual: 1
})

@ccclass("TextInfo")
class TextInfo {
    @property({
        displayName: "文本"
    })
    text = "";
    @property({
        type: cc.Font,
        displayName: "字体"
    })
    font: cc.Font = null;
}

@ccclass("LangConfig")
class LangConfig {
    @property({
        type: TextInfo,
        displayName: "简体"
    })
    zh: TextInfo = null;
    @property({
        type: TextInfo,
        displayName: "繁体"
    })
    zh_ft: TextInfo = null;
    @property({
        type: TextInfo,
        displayName: "英文"
    })
    en: TextInfo = null;
}

@ccclass
export default class Language extends cc.Component {
    @property({
        type: EMode,
        tooltip: "ID: 通过ID从语言表加载内容和字体\nManual: 手动配置不同语言的文本和字体\n注意: 需要在不用语言使用不同字体时,请勾选label的useSystemFont属性",
        visible: function () {
            return this.getComponent(cc.Label)
                || this.getComponent(cc.RichText);
        }
    })
    mode = EMode.ID;
    @property({
        tooltip: "语言表中的ID",
        visible: function () {
            return this.mode == EMode.ID &&
                (this.getComponent(cc.Label)
                    || this.getComponent(cc.RichText));
        }
    })
    ID = 0;
    @property({
        tooltip: "不同语言的文本和字体",
        type: LangConfig,
        visible: function () {
            return this.mode == EMode.Manual &&
                (this.getComponent(cc.Label)
                    || this.getComponent(cc.RichText));
        }
    })
    config: LangConfig = null;
    @property({
        tooltip: "图片名字",
        visible: function () {
            return this.getComponent(cc.Sprite);
        }
    })
    spriteName = "";

    private args: any[] = null;

    onLoad() {
        if (this.ID || this.spriteName) {
            this.updateContent();
            Language.list.push(this);
        } else {
            console.warn(`${this.node.name} ID=${this.ID} PicName=${this.spriteName}`);
        }
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
                if (this.mode == EMode.ID) {
                    if (this.args) {
                        Language.setStringByID(comp, this.ID, ...this.args);
                    } else {
                        Language.setStringByID(comp, this.ID);
                    }
                } else {
                    let textInfo: TextInfo = this.config[app.lang];
                    if (textInfo) {
                        let context: string = textInfo.text;
                        context = context.replace(/\\n/g, "\n");
                        if (this.args) {
                            context = Utils.formatString(context, ...this.args);
                        }
                        comp.string = context;
                        if (comp.useSystemFont) {
                            comp.font = textInfo.font;
                        }
                    }
                }
                this.args ? Language.setStringByID(comp, this.ID, ...this.args) : Language.setStringByID(comp, this.ID);
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
        label.useSystemFont && this.setFontByID(label, ID);
        label.string = this.getStringByID(ID, ...args) || label.string;
    }

    static setSpriteFrameByName(sprite: cc.Sprite, name: string) {
        Utils.loadPicture(sprite, `language/${app.lang}/${name}`);
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

    static setFontByID(label: cc.Label | cc.RichText, ID: number) {
        if (!this.dict) {
            console.warn(`未初始化语言表`);
            return;
        }
        if (!this.dict[ID]) {
            console.warn(`ID=${ID} Lang=${app.lang} 语言表中无对应内容`);
            return;
        }
        let fontName = this.dict[ID][app.lang + "_font"];
        if (!fontName) {
            label.font == null;
        } else {
            Utils.load("font/" + fontName, cc.Font).then(v => {
                label.font = v;
            })
        }
    }
}
