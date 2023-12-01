
import { _decorator, tween } from 'cc';
import { App } from '../../../mlib/App';
import { AssetMgr } from '../../../mlib/manager/AssetMgr';
import { UIBase } from '../../../mlib/module/ui/manager/UIBase';
import { UIConstant } from '../../gen/UIConstant';
import { UIHUDProperty } from '../../gen/property/UIHUDProperty';
import { GameData } from '../GameData';

const { ccclass, property } = _decorator;

@ccclass('UIHUD')
export class UIHUD extends UIBase {
    protected property: UIHUDProperty;

    // pro

    onLoad() {
        super.onLoad();
        this.property = new UIHUDProperty(this.node);
        console.log(this.property.node222Tf);
        

        
        // this.property.n
        // Utils.loadSprite(this.bg1, "texture/bg1");
        // Utils.loadSprite(this.bg1,"https://yourdomain.com/1.jpg");

        let a = { a: 1 };
        tween(a).to(3, { a: 100 }, {
            onComplete(target?) {
                console.log(a.a);

            },
        }).start();

        console.log(AssetMgr.projectBundles);
        console.log(GameData.Inst.getSerializeStr());
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


