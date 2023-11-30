import { Font, Label, RichText, Sprite, TTFFont } from "cc";
import { MLogger } from "../logger/MLogger";
import { IL10n } from "./IL10n";
import { AssetHandler } from "../../component/AssetHandler";
import { AssetMgr } from "../../manager/AssetMgr";
import { App } from "../../App";
import GameTable from "../../../scripts/base/GameTable";
import { Utils } from "../../utils/Utils";


/** 组件托管时的参数 */
class CompManagedArgs {
    public key: string;
    public args: any[];
    public delegate: () => string;
    public assetHandler: AssetHandler;
}

/** 多语言管理器 */
export class L10nMgr {
    private static font: Font | TTFFont;
    private static lastFont: Font | TTFFont;
    private static get fontPath() { return `${App.lang}/font`; }
    private static unmanagedList: Set<IL10n> = new Set();
    private static managedMap: Map<Label | RichText | Sprite, CompManagedArgs> = new Map();

    /** 初始化 */
    public static async init() {
        this.clear();
        await this.loadFont();
    }

    /** 切换多语言 */
    public static async switchLanguage() {
        await this.loadFont();
        this.reload();
    }

    /** 添加一个非托管对象 */
    public static add(value: IL10n) {
        this.unmanagedList.add(value);
    }

    /** 移除一个非托管对象 */
    public static remove(value: IL10n) {
        this.unmanagedList.delete(value);
    }

    /** 将渲染组件取消托管 */
    public static cancelManaged(comp: Label | RichText | Sprite) {
        this.managedMap.delete(comp);
    }

    /** 清除所有数据 */
    public static clear() {
        this.unmanagedList.clear();
        this.managedMap.clear();
        this.lastFont?.isValid && this.lastFont.destroy();
        this.font?.isValid && this.font.destroy();
        this.lastFont = null;
        this.font = null;
    }

    /** 当前语言的字体 */
    public static getFont() {
        return this.font;
    }

    /** 加载当前语言的字体 */
    private static async loadFont() {
        this.lastFont = this.font;
        if (AssetMgr.isAssetExists(this.fontPath)) {
            this.font = await AssetMgr.loadAsset(this.fontPath, Font);
        } else if (AssetMgr.isAssetExists(this.fontPath)) {
            this.font = await AssetMgr.loadAsset(this.fontPath, TTFFont);
        } else {
            this.font = null;
        }
        if (this.lastFont?.isValid && this.font?.isValid && this.lastFont != this.font) {
            this.lastFont.destroy();
            this.lastFont = null;
        }
    }

    private static reload() {
        //刷新托管内容
        let invalidList: (Label | RichText | Sprite)[] = [];
        this.managedMap.forEach((v, k) => {
            if (k.isValid) {
                if (k instanceof Sprite) {
                    this.setSpriteFrameByKey(k, v.key, v.assetHandler);
                } else {
                    if (v.delegate) this.setStringByDelegate(k, v.delegate);
                    else this.setStringByKey(k, v.key, ...v.args);
                }
            } else {
                invalidList.push(k);
            }
        });
        invalidList.forEach(v => {
            this.managedMap.delete(v);
        });
        //刷新非托管内容
        this.unmanagedList.forEach(v => {
            v.refreshContent();
        });
    }

    /** 为文本组件设置文本并加入托管，在切换语言时自动刷新内容 */
    public static setStringAndManage(text: Label | RichText, key: string, ...args: any[]) {
        let compArgs = this.managedMap.get(text) || new CompManagedArgs();
        compArgs.key = key;
        compArgs.args = args;
        this.managedMap.set(text, compArgs);
        this.setStringByKey(text, key, ...args);
    }

    /** 为文本组件设置文本并加入托管，在切换语言时自动刷新内容 (文本内容比较复杂，通过一个方法来获取内容)  */
    public static setStringByDelegateAndManage(text: Label | RichText, delegate: () => string) {
        let compArgs = this.managedMap.get(text) || new CompManagedArgs();
        compArgs.delegate = delegate;
        this.managedMap.set(text, compArgs);
        this.setStringByDelegate(text, delegate);
    }


    /** 为图片组件设置图片并加入托管，在切换语言时自动刷新内容 */
    public static setSpriteFrameAndManage(sprite: Sprite, key: string, assetHandler?: AssetHandler) {
        let compArgs = this.managedMap.get(sprite) || new CompManagedArgs();
        compArgs.key = key;
        compArgs.assetHandler = assetHandler;
        this.managedMap.set(sprite, compArgs);
        this.setSpriteFrameByKey(sprite, key, assetHandler);
    }

    /** 为文本组件设置文本 */
    public static setStringByKey(text: Label | RichText, key: string, ...args: any[]) {
        text.string = this.getStringByKey(key, ...args) || text.string;
    }

    /** 为文本组件设置文本 */
    public static setStringByDelegate(text: Label | RichText, delegate: () => string) {
        text.string = delegate();
    }

    /** 为图片组件设置图片 */
    public static setSpriteFrameByKey(sprite: Sprite, key: string, assetHandler?: AssetHandler) {
        let location = `${App.lang}/${key}`;
        if (assetHandler?.isValid) {
            assetHandler.loadSprite(sprite, location);
        } else {
            AssetMgr.loadSprite(sprite, location);
        }
    }

    /** 通过Key获取语言表上当前语言的内容 */
    public static getStringByKey(key: string, ...args: any[]): string {
        let data = GameTable.Inst.Table.TbLocalization.get(key);
        if (!data) {
            MLogger.error(`key=${key} Lang=${App.lang}  在语言表中无对应内容`);
            return "";
        }
        return Utils.formatString(data[App.lang], ...args);
    }

    /** 通过Key获取图片资源的加载路径 */
    public static getImagePathByKey(key: string): string {
        return `${App.lang}/${key}`;
    }

}