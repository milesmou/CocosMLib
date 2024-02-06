
import { Node, Prefab, _decorator } from 'cc';
import { App } from '../../../mlib/App';
import { UIBase } from '../../../mlib/module/ui/manager/UIBase';
import { UIConstant } from '../../gen/UIConstant';

const { ccclass, property } = _decorator;

@ccclass('UIHUD')
export class UIHUD extends UIBase {


    protected start(): void {
        let Node222 = this.rc.get("Node222", Node);
        let ui = this.rc.get("Node222", UIBase);
        let Node2221 = this.rc.getNode("Node222");
        let haha = this.rc.get("asdas", Prefab);
        console.log(Node222);
        console.log(ui);
        console.log(Node2221);
        console.log(haha);

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
            case "UIExtend":
                App.ui.show(UIConstant.UIExtend);
                break;
            case "ScrollviewEnhance":
                App.ui.show(UIConstant.UIScrollviewEnhance);
                break;
                case "HH":
                App.tipMsg.showToast("HH");
                break;
        }
    }

}


