
import { _decorator, tween } from 'cc';
import { App } from '../../../mlib/App';
import { AssetMgr } from '../../../mlib/module/asset/AssetMgr';
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



        // this.property.n
        // Utils.loadSprite(this.bg1, "texture/bg1");
        // Utils.loadSprite(this.bg1,"https://yourdomain.com/1.jpg");

        let a = { a: 1 };
        tween(a).to(3, { a: 100 }, {
            onComplete(target?) {
                console.log(a.a);

            },
        }).start();

        console.log(GameData.Inst.getSerializeStr());
    }

    protected onClickButton(btnName: string): void {
        switch (btnName) {
            case "AudioMgr":
                App.ui.show(UIConstant.UIAudioMgr);
                break;
            case "UIMgr":
                App.ui.show(UIConstant.UIUIMgr);
                break;
            case "Guide":
                App.ui.show(UIConstant.UIGuideTest1);
                break;
            case "ButtonHelper":
                App.ui.show(UIConstant.UIButtonHelper);
                break;
        }
    }

}


