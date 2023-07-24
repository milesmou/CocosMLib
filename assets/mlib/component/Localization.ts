import { Component, Enum, Label, Node, RichText, Sprite, _decorator } from 'cc';
import GameTable from '../../script/base/GameTable';
const { ccclass, property } = _decorator;

import { App } from "../App";
import { AssetMgr } from '../manager/AssetMgr';
import { CCUtils } from '../utils/CCUtil';
import { Utils } from "../utils/Utils";
import { UIBase } from './UIBase';

interface Language {
    sc: string;
    tc: string;
    en: string;
}

const ELocalizationType = Enum({
    Single: 0,
    Multiple: 1,
})

@ccclass("LocalizationNode")
class LocalizationNode {
    @property(Node)
    sc: Node = null;
    @property(Node)
    tc: Node = null;
    @property(Node)
    en: Node = null;
}

/** 多语言组件 渲染组件应在当前节点或指定的节点上*/
@ccclass("Localization")
export class Localization extends Component {
    @property({
        tooltip: "语言表中的key"
    })
    key: string = "";

    @property({
        type: ELocalizationType,
        tooltip: "Single:单节点(所有语言共用同一节点) Multiple:多节点(每种语言对应一个节点)"
    })
    type = ELocalizationType.Single;
    @property({
        type: LocalizationNode,
        tooltip: "每种语言对应的节点"
    })
    multipleNode: LocalizationNode;

    private ui: UIBase;
    private args: any[] = null;

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
    setStringArgs(...args: any[]) {
        this.args = args;
        this.refreshContent();
    }

    refreshContent() {
        let node: Node;
        if (this.type == ELocalizationType.Single) node = this.node;
        else if (this.multipleNode) {
            node = this.multipleNode[App.lang];
        }
        if (node) {
            for (const comp of node.components) {
                if (comp instanceof Label || comp instanceof RichText) {
                    Localization.setStringByKey(comp, this.key, ...this.args);
                    return;
                } else if (comp instanceof Sprite) {
                    Localization.setSpriteFrameByKey(comp, this.key, this.ui);
                    return;
                }
            }
        } else {
            console.error(`Localization ${App.lang} 节点不存在 ${CCUtils.getNodePath(this.node)}`);
        }
    }

    static list: Localization[] = [];

    static reload() {
        this.list.forEach(v => {
            v.isValid && v.refreshContent();
        });
    }

    static setStringByKey(label: Label | RichText, key: string, ...args: any[]) {
        label.string = this.getTextByKey(key, ...args) || label.string;
    }

    static setSpriteFrameByKey(sprite: Sprite, key: string, ui?: UIBase) {
        let location = `${App.lang}/${key}`;
        if (ui?.isValid) {
            ui.loadSprite(sprite, location);
        } else {
            AssetMgr.loadSprite(sprite, location);
        }
    }

    /** 通过Key获取语言表上当前语言的内容 */
    static getTextByKey(key: string, ...args: any[]): string {
        let data = GameTable.Inst.Table.TbLocalization.get(key);
        if (!data) {
            console.error(`key=${key} Lang=${App.lang}  在语言表中无对应内容`);
            return "";
        }
        return Utils.formatString(data[App.lang], ...args);
    }
}

