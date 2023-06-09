
import { Sprite, tween, _decorator } from 'cc';
import { App } from '../../../App';
import { AssetMgr } from '../../../manager/AssetMgr';
import { UIBase } from '../../../ui/UIBase';
import { TestUIConst } from '../TestUIConst';

const { ccclass, property } = _decorator;

@ccclass('UITestMain')
export class UITestMain extends UIBase {
    //gen pro
    @property(Sprite)
    bg1!: Sprite;

    onLoad() {
        // Utils.loadSprite(this.bg1, "texture/bg1");
        // Utils.loadSprite(this.bg1,"https://yourdomain.com/1.jpg");

        let a = { a: 1 };
        tween(a).to(3, { a: 100 }, {
            onComplete(target?) {
                console.log(a.a);

            },
        }).start();

        console.log(AssetMgr.projectBundles);
    }

    onClickAudioMgr() {
        App.ui.show(TestUIConst.UIAudioMgr);
    }

    onClickUIMgr() {
        App.ui.show(TestUIConst.UIUIMgr);
    }

    onClickGuide() {
        App.ui.show(TestUIConst.UIGuideTest1);
    }
    onClickButtonHelper() {
        App.ui.show(TestUIConst.UIButtonHelper);
    }
}


