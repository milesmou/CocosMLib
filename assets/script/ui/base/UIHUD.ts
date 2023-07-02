
import { Sprite, tween, _decorator } from 'cc';
import { App } from '../../../mlib/App';
import { UIBase } from '../../../mlib/component/UIBase';
import { AssetMgr } from '../../../mlib/manager/AssetMgr';
import { UIConstant } from '../../gen/UIConstant';

const { ccclass, property } = _decorator;

@ccclass('UITestMain')
export class UIHUD extends UIBase {
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
        App.ui.show(UIConstant.UIAudioMgr);
    }

    onClickUIMgr() {
        App.ui.show(UIConstant.UIUIMgr);
    }

    onClickGuide() {
        App.ui.show(UIConstant.UIGuideTest1);
    }
    onClickButtonHelper() {
        App.ui.show(UIConstant.UIButtonHelper);
    }
}


