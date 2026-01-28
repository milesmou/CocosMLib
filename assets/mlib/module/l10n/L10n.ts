import { Enum, Label, Node, RichText, Sprite, _decorator } from "cc";

const { ccclass, property, menu } = _decorator;

import { UIComponent } from "../ui/manager/UIComponent";
import { IL10n } from "./IL10n";
import { L10nMgr } from "./L10nMgr";


const ELocalizationType = Enum({
    Single: 0,
    Multiple: 1,
})

@ccclass("L10nNode")
class L10nNode {
    @property({
        type: Node,
        displayName: "简体"
    })
    sc: Node = null;
    @property({
        type: Node,
        displayName: "繁体"
    })
    tc: Node = null;
    @property({
        type: Node,
        displayName: "英文"
    })
    en: Node = null;
}

/** 多语言组件 渲染组件应在当前节点或指定的节点上*/
@ccclass
export class L10n extends UIComponent implements IL10n {
    @property({
        tooltip: "文本组件为语言表中的key，图片组件为图片名字"
    })
    private key: string = "";

    @property({
        type: ELocalizationType,
        tooltip: "Single:单节点(所有语言共用同一节点)\nMultiple:多节点(每种语言对应一个节点)"
    })
    private type = ELocalizationType.Single;
    @property({
        type: L10nNode,
        tooltip: "每种语言对应的节点",
        visible: function () { return this.type == ELocalizationType.Multiple; }
    })
    private multipleNode: L10nNode = null;
    @property({
        tooltip: "是否需要在切换语言的时候切换字体",
    })
    private needSwitchFont = false;

    private args: any[] = [];

    protected onLoad() {
        app.l10n.add(this);
        this.refreshContent();
    }

    protected onDestroy() {
        app.l10n.remove(this);
    }

    /** 设置文本参数并刷新内容(针对文本中有动态内容,便于切换语言环境自动刷新内容) */
    public setStringArgs(...args: any[]) {
        this.args = args;
        this.refreshContent();
    }

    /** 刷新显示内容 */
    public refreshContent() {
        if (!this.isValid) return;
        let node: Node;
        if (this.type == ELocalizationType.Single) {
            node = this.node;
        } else if (this.multipleNode) {
            for (const key in this.multipleNode) {
                let n: Node = this.multipleNode[key];
                if (!n?.isValid) continue;
                n.active = key == L10nMgr.lang;
                if (n.active) node = this.multipleNode[L10nMgr.lang];
            }
        }
        if (node) {
            for (const comp of node.components) {
                if (comp instanceof Label || comp instanceof RichText) {
                    if (this.needSwitchFont) {
                        let font = app.l10n.getFont();
                        if (font) {
                            comp.useSystemFont = false;
                            comp.font = font;
                        } else {
                            comp.useSystemFont = true;
                            comp.font = undefined;
                        }
                        comp.enabled = false;
                        this.scheduleOnce(() => {
                            comp.enabled = true;
                        })
                    }
                    app.l10n.setStringByKey(comp, this.key, ...this.args);
                    return;
                } else if (comp instanceof Sprite) {
                    app.l10n.setSpriteFrameByKey(comp, this.key, this.asset);
                    return;
                }
            }
        } else {
            mLogger.warn(`Localization ${L10nMgr.lang} 节点不存在 ${node.getPath()}`);
        }
    }


}

