import { Enum, Label, Node, RichText, Sprite, _decorator } from "cc";

const { ccclass, property, menu } = _decorator;

import { App } from "../../App";
import { CCUtils } from "../../utils/CCUtil";
import { MLogger } from "../logger/MLogger";
import { UIContainerItem } from "../ui/manager/UIContainerItem";
import { IL10n } from "./IL10n";


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
export class L10n extends UIContainerItem implements IL10n {
    @property({
        tooltip: "文本组件为语言表中的key，图片组件为图片名字"
    })
    key: string = "";

    @property({
        type: ELocalizationType,
        tooltip: "Single:单节点(所有语言共用同一节点)\nMultiple:多节点(每种语言对应一个节点)"
    })
    type = ELocalizationType.Single;
    @property({
        type: L10nNode,
        tooltip: "每种语言对应的节点",
        visible: function () { return this.type == ELocalizationType.Multiple; }
    })
    multipleNode: L10nNode = null;
    @property({
        tooltip: "是否需要在切换语言的时候切换字体",
    })
    needSwitchFont = false;

    private args: any[] = [];

    onLoad() {
        super.onLoad();
        App.l10n.add(this);
        this.refreshContent();
    }

    onDestroy() {
        App.l10n.remove(this);
    }

    /** 设置文本参数并刷新内容(针对文本中有动态内容,便于切换语言环境自动刷新内容) */
    setStringArgs(...args: any[]) {
        this.args = args;
        this.refreshContent();
    }

    refreshContent() {
        if (!this.isValid) return;
        let node: Node;
        if (this.type == ELocalizationType.Single) node = this.node;
        else if (this.multipleNode) {
            for (const key in this.multipleNode) {
                let n: Node = this.multipleNode[key];
                if (!n?.isValid) continue;
                n.active = key == App.lang;
                if (n.active) node = this.multipleNode[App.lang];
            }
        }
        if (node) {
            for (const comp of node["_components"]) {
                if (comp instanceof Label || comp instanceof RichText) {
                    if (this.needSwitchFont) {
                        let font = App.l10n.getFont();
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
                    App.l10n.setStringByKey(comp, this.key, ...this.args);
                    return;
                } else if (comp instanceof Sprite) {
                    App.l10n.setSpriteFrameByKey(comp, this.key, this.asset);
                    return;
                }
            }
        } else {
            MLogger.warn(`Localization ${App.lang} 节点不存在 ${CCUtils.getNodePath(this.node)}`);
        }
    }


}

