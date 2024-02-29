import { Font, Label, RichText, Sprite, TTFFont, sys } from "cc";
import GameTable from "../../../scripts/base/GameTable";
import { GameSetting } from "../../GameSetting";
import { Utils } from "../../utils/Utils";
import { AssetComponent } from "../asset/AssetComponent";
import { AssetMgr } from "../asset/AssetMgr";
import { MLogger } from "../logger/MLogger";
import { StroageValue } from "../stroage/StroageValue";
import { ELanguage, ELanguageCode } from "./ELanguage";
import { IL10n } from "./IL10n";


/** 组件托管时的参数 */
class CompManagedArgs {
    public key: string;
    public args: any[];
    public delegate: () => string;
    public asset: AssetComponent;
}

/** 多语言管理器 */
export class L10nMgr {

    private static languageCode = new StroageValue("UserLanguageCodeKey", "");;

    private static m_lang: ELanguageCode;
    public static get lang() {
        if (!this.m_lang) this.m_lang = this.getLanguage();
        return this.m_lang;
    }

    private static font: Font | TTFFont;
    private static lastFont: Font | TTFFont;
    private static get fontPath() { return `${this.lang}/font`; }
    private static unmanagedList: Set<IL10n> = new Set();
    private static managedMap: Map<Label | RichText | Sprite, CompManagedArgs> = new Map();
    /** 初始化 */
    public static async init() {
        this.clear();
        await this.loadFont();
    }

    /** 获取语言环境 */
    private static getLanguage(): ELanguageCode {
        let languageId = GameSetting.Inst.languageId;
        let v: ELanguageCode = ELanguageCode.ChineseSimplified;
        if (languageId == ELanguage.Auto) {
            let code = this.languageCode.value;
            if (code) {
                v = code as ELanguageCode;
            }
            else {
                if (sys.languageCode == "zh") v = ELanguageCode.ChineseSimplified;
                else if (sys.languageCode.startsWith("zh")) v = ELanguageCode.ChineseTraditional;
                else v = ELanguageCode.English;
            }
        } else if (languageId == ELanguage.SimplifiedChinese) {
            v = ELanguageCode.ChineseSimplified;
        } else if (languageId == ELanguage.TraditionalChinese) {
            v = ELanguageCode.ChineseTraditional;
        } else {
            v = ELanguageCode.English;
        }
        return v;
    }

    /** 切换语言 */
    public static async switchLanguage(languageCode: ELanguageCode) {
        if (this.lang == languageCode) return;
        this.m_lang = languageCode;
        this.languageCode.value = this.languageCode.value;
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
                    this.setSpriteFrameByKey(k, v.key, v.asset);
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
    public static setSpriteFrameAndManage(sprite: Sprite, key: string, asset?: AssetComponent) {
        let compArgs = this.managedMap.get(sprite) || new CompManagedArgs();
        compArgs.key = key;
        compArgs.asset = asset;
        this.managedMap.set(sprite, compArgs);
        this.setSpriteFrameByKey(sprite, key, asset);
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
    public static setSpriteFrameByKey(sprite: Sprite, key: string, asset?: AssetComponent) {
        let location = `${this.lang}/${key}`;
        if (asset) {
            asset.loadSprite(sprite, location);
        } else {
            AssetMgr.loadSprite(sprite, location);
        }
    }

    /** 通过Key获取语言表上当前语言的内容 */
    public static getStringByKey(key: string, ...args: any[]): string {
        let data = GameTable.Inst.Table.TbLocalization.get(key);
        if (!data) {
            MLogger.error(`key=${key} Lang=${this.lang}  在语言表中无对应内容`);
            return "";
        }
        return Utils.formatString(data[this.lang], ...args);
    }

    /** 通过Key获取图片资源的加载路径 */
    public static getImagePathByKey(key: string): string {
        return `${this.lang}/${key}`;
    }

}