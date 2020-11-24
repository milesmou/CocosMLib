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
        tooltip: "显示内容在语言表中的ID"
    })
    ID = 0;

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

    updateContent() {
        let comps: cc.Component[] = this.node["_components"];
        for (let i = 0, len = comps.length; i < len; i++) {
            let comp = comps[i];
            if (comp instanceof cc.Label || comp instanceof cc.RichText) {
                let content = Language.args[this.ID] ? Language.getStringByID(this.ID, ...Language.args[this.ID]) : Language.getStringByID(this.ID);
                comp.string = content || comp.string;
                break;
            } else if (comp instanceof cc.Sprite) {
                Language.getSpriteFrameByID(this.ID, comp);
                break;
            }
        }
    }

    static list: Language[] = [];
    static args: { [ID: number]: any[] } = {};
    static dict: { [ID: number]: any } = null;
    static atlas: cc.SpriteAtlas = null;
    static init(dict: { [ID: number]: any }, atlas: cc.SpriteAtlas) {
        this.dict = this.dict || dict;
        this.atlas = this.atlas || atlas;
    }

    static reload() {
        this.list.forEach(v => {
            v.isValid && v.updateContent();
        })
    }

    static getStringByID(ID: number, ...args): string {
        if (!this.dict) return;
        if (!this.dict[ID] || !this.dict[ID][mm.lang]) {
            console.warn(`ID=${ID} Lang=${mm.lang}  在语言表中无对应内容`);
            return "";
        }
        if (args.length > 0) {
            this.args[ID] = args;
        }
        return Utils.formatString(this.dict[ID][mm.lang], ...args);
    }

    static getSpriteFrameByID(ID: number, sprite: cc.Sprite) {
        if (!this.dict || !this.atlas) return;
        let name = this.getStringByID(ID);
        let spriteFrame = this.atlas.getSpriteFrame(name);
        if (spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        }
    }

}
