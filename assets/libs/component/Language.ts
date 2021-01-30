import { Utils } from "../utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Language extends cc.Component {
    @property({
        readonly: true,
        displayName: "警告",
        tooltip: "节点上必须有Label、RichText、Sprite其中一个组件",
        visible: function () {
            return !this.getComponent(cc.Label)
                && !this.getComponent(cc.RichText)
                && !this.getComponent(cc.Sprite);
        }
    })
    Tip = true;
    @property({
        tooltip: "内容在语言表中的ID",
        visible: function () {
            return this.getComponent(cc.Label)
                || this.getComponent(cc.RichText);
        }
    })
    ID = 0;
    @property({
        tooltip: "图片名字",
        visible: function () {
            return this.getComponent(cc.Sprite);
        }
    })
    Name = "";

    private args: any[] = null;

    onLoad() {
        if (this.ID || this.Name) {
            this.updateContent();
            Language.list.push(this);
        } else {
            console.warn(`${this.node.name} ID=${this.ID} PicName=${this.Name}`);
        }
    }

    onDestroy() {
        let index = Language.list.indexOf(this);
        if (index > -1) {
            Language.list.splice(index, 1);
        }
    }

    /** 设置参数并刷新内容(主要针对文本中有动态内容) */
    setArgs(...args) {
        this.args = args;
        this.updateContent();
    }

    updateContent() {
        let comps: cc.Component[] = this.node["_components"];
        for (let i = 0, len = comps.length; i < len; i++) {
            let comp = comps[i];
            if (comp instanceof cc.Label || comp instanceof cc.RichText) {
                this.args ? Language.setStringByID(comp, this.ID, ...this.args) : Language.setStringByID(comp, this.ID);
                break;
            } else if (comp instanceof cc.Sprite) {
                Language.setSpriteFrameByName(comp, this.Name);
                break;
            }
        }
    }

    static list: Language[] = [];
    static dict: { [ID: number]: any } = null;
    static picPath = "language/";
    static init(dict: { [ID: number]: any }) {
        this.dict = this.dict || dict;
    }

    static reload() {
        this.list.forEach(v => {
            v.isValid && v.updateContent();
        })
    }

    static setStringByID(label: cc.Label | cc.RichText, ID: number, ...args) {
        label.string = this.getStringByID(ID, ...args) || label.string;
    }

    static setSpriteFrameByName(sprite: cc.Sprite, name: string) {
        Utils.loadPicture(sprite, `${this.picPath}${mm.lang}/${name}`)
    }

    static getStringByID(ID: number, ...args): string {
        if (!this.dict) {
            console.warn(`未初始化语言表`);
            return;
        };
        if (!this.dict[ID] || !this.dict[ID][mm.lang]) {
            console.warn(`ID=${ID} Lang=${mm.lang}  在语言表中无对应内容`);
            return;
        }
        return Utils.formatString(this.dict[ID][mm.lang], ...args);
    }
}
