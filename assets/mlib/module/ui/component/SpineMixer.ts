
import { _decorator, CCString, sp, TextAsset, Texture2D } from 'cc';
import { AssetMgr } from '../../asset/AssetMgr';
import { MComponent } from '../../core/MComponent';

/**
 Spine导出方式：spine制作时使用多皮肤来换装，导出spine文件时纹理图集打包为图片文件夹；导入cocos时只导入动画文件和atlas文本文件，图片资源单独导入到动态加载的资源目录中。
 */

const { ccclass, property, requireComponent } = _decorator;
/** Spine换装组件 (基于多皮肤机制，按需动态加载资源) */
@ccclass('SpineMixer')
@requireComponent(sp.Skeleton)
export class SpineMixer extends MComponent {

    @property(sp.SkeletonData)
    protected skeletonJson: sp.SkeletonData = null;
    @property(TextAsset)
    protected atlasText: TextAsset = null;
    @property({ tooltip: "Spine图片资源根路径" })
    protected imagesRoot = "";
    @property({ type: CCString, tooltip: "Spine基础的皮肤，会和传入的皮肤数组一起显示" })
    protected baseSkins = ["default"];
    @property({ tooltip: "是否根据所在的界面自动释放图片资源" })
    protected autoRelease = false;


    /** Spine组件 */
    public get spine() { return this._skeleton; }

    /** Spine组件 */
    private _skeleton: sp.Skeleton;
    /** 图集文件中所有的图片名 */
    private _allImages: string[] = [];
    /** Spine区域名到图片名的映射 */
    private _atlasMap: Map<string, string> = null;
    /** 创建好的SkeletonData缓存 */
    private _skeletonDataCache: Map<string, sp.SkeletonData> = new Map<string, sp.SkeletonData>();


    protected __preload(): void {
        this._skeleton = this.getComponent(sp.Skeleton);
        if (this.atlasText) this.parseSpineAtlas(this.atlasText.text);
    }

    /** 未在组件属性面板设置参数时，用此方法设置 */
    public setData(_skeletonJson: sp.SkeletonData, _atlasText: TextAsset, _imagesRoot: string, _baseSkins: string[], _autoRelease = false) {
        this.skeletonJson = _skeletonJson;
        this.atlasText = _atlasText;
        this.imagesRoot = _imagesRoot;
        this.baseSkins = _baseSkins;
        this.autoRelease = _autoRelease;
        this.parseSpineAtlas(this.atlasText.text);
    }

    /**
     * 设置Spine同时显示多个皮肤
     * @param onAsyncLoad 异步加载开始时的回调
     */
    public async setSkins(skinNames: string[], onAsyncLoad?: () => void) {
        if (!this._skeleton?.isValid) return;
        skinNames = this.baseSkins.concat(skinNames);
        let skinCacheKey = skinNames.sort().join(",");
        let combinedSkeletonData: sp.SkeletonData = this._skeletonDataCache.get(skinCacheKey);
        if (!combinedSkeletonData) {
            onAsyncLoad && onAsyncLoad();
            //获取皮肤包含的附件名
            let attachmentNames = this.getSkinAttachmentNames(this.skeletonJson, skinNames);
            //根据附件名找到需要加载的贴图文件名 需保证图片名数组的长度与顺序和atlas中的一致
            let imageNames = this.findRequiredTextures(this._atlasMap, attachmentNames);
            imageNames = this._allImages.concat().map(v => imageNames.includes(v) ? v : null);
            //加载贴图文件
            let textures: Texture2D[] = await this.loadSpineTextures(imageNames);
            //创建新的SkeletonData
            combinedSkeletonData = this.createSkeletonData(
                this.atlasText.text,
                textures,
                imageNames
            );
            this._skeletonDataCache.set(skinCacheKey, combinedSkeletonData);
        }
        if (this._skeleton.isValid && this._skeleton.skeletonData != combinedSkeletonData) {
            this._skeleton.skeletonData = combinedSkeletonData;
            this._skeleton.setSkins(skinNames);
            this._skeleton.setSlotsToSetupPose();
        }
    }


    /**
    * 解析 .atlas.txt 文本内容，返回区域名到纹理文件的映射。
    * @param atlasText 整个 .atlas.txt 文件的文本内容。
    */
    private parseSpineAtlas(atlasText: string) {
        this._atlasMap = new Map<string, string>();

        const lines = atlasText.split(/\r?\n/);
        let currentTextureName: string = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.length === 0) continue;

            if (line.endsWith('.png')) {
                currentTextureName = trimmedLine.replace('.png', '');
                this._allImages.push(currentTextureName);
                continue;
            }

            if (!trimmedLine.includes(':')) {
                this._atlasMap.set(trimmedLine, currentTextureName);
                continue;
            }
        }
    }

    /**
     * 获取皮肤包含的所有附件名 (Attachment Name)
     */
    private getSkinAttachmentNames(skeletonData: sp.SkeletonData, skinNames: string[]): Map<string, Set<string>> {

        const runtimeData = skeletonData.getRuntimeData();
        const result = new Map<string, Set<string>>();

        for (const skinName of skinNames) {
            const skin = runtimeData.findSkin(skinName);

            if (!skin) {
                console.warn(`未找到皮肤: ${skinName}`);
                continue;
            }

            const key = skinName.substring(skinName.lastIndexOf("/") + 1);
            const attachmentNames = new Set<string>();
            result.set(key, attachmentNames);

            for (const attachment of skin.attachments) {
                attachmentNames.add((attachment as any).name);
            }
        }

        return result;
    }

    /**
     * 从完整的 atlas 文本中，找出给定皮肤列表依赖的所有贴图文件
     * @param atlasMap 区域名到图片名字的映射
     * @param attachmentMap 皮肤名字到附件名集合的映射
     * @return 需要加载的贴图文件名列表
     */
    private findRequiredTextures(atlasMap: Map<string, string>, attachmentMap: Map<string, Set<string>>): string[] {
        const requiredTextures: Set<string> = new Set<string>();

        for (const [skinName, attachmentNames] of attachmentMap.entries()) {
            for (const attachmentName of attachmentNames) {
                let textureName: string = null;
                const regionName1 = skinName + "/" + skinName + "/" + attachmentName;
                const regionName2 = skinName + "/" + attachmentName;
                textureName = atlasMap.get(regionName1) || atlasMap.get(regionName2) || atlasMap.get(attachmentName);
                if (textureName) {
                    requiredTextures.add(textureName);
                } else {
                    console.warn(`未找到附件对应的贴图: ${attachmentName} (皮肤: ${skinName})`);
                }
            }
        }

        return Array.from(requiredTextures);
    }

    /** 加载需要的图片 */
    private async loadSpineTextures(textureNames: string[]): Promise<Texture2D[]> {
        let textures: Texture2D[] = [];
        for (let i = 0; i < textureNames.length; i++) {
            const name = textureNames[i];
            if (!name) {
                textures[i] = null;
                continue;
            }
            let path = this.imagesRoot + "/" + name;
            let tex: Texture2D = null;
            if (this.autoRelease) {
                tex = await this.asset.loadAsset(path, Texture2D);
            } else {
                tex = await AssetMgr.loadAsset(path, Texture2D);
            }
            textures[i] = tex;
        }
        return textures;
    }


    /**
     * 创建一个新的 SkeletonData 实例
     */
    private createSkeletonData(atlasText: string, textures: Texture2D[], textureNames: string[]): sp.SkeletonData {

        const skeletonData = new sp.SkeletonData();
        // 关键：所有皮肤都使用同一个骨骼JSON
        skeletonData.skeletonJson = this.skeletonJson.skeletonJson;

        // 关键：合并后的 atlas.txt 文本
        skeletonData.atlasText = atlasText;

        // 关键：所有需要用到的 Texture2D 对象
        skeletonData.textures = textures;

        // 关键：所有 Texture2D 对应的文件名（必须与 atlasText 中的声明一致）
        skeletonData.textureNames = textureNames.map(v => v + ".png");

        return skeletonData;
    }
}