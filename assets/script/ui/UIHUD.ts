
import { _decorator, Component, Node, Sprite, resources, assetManager, ImageAsset, Texture2D, SpriteFrame, utils } from 'cc';
import { app } from '../../mm/App';
import { UIBase } from '../../mm/ui/UIBase';
import { Utils } from '../../mm/utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('UIHUD')
export class UIHUD extends UIBase {
    @property(Sprite)
    bg1!: Sprite;

    onLoad() {
        // Utils.loadSprite(this.bg1, "texture/bg1");
        // Utils.loadSprite(this.bg1,"https://yourdomain.com/1.jpg");
    }

    onClickAudioMgr() {
        app.ui.show(app.uiKey.UIAudioMgr);
    }

    onClickUIMgr() {
        app.ui.show(app.uiKey.UIUIMgr);
    }

    onClickGuide(){
        app.ui.show(app.uiKey.UIGuideTest1);
    }
}


