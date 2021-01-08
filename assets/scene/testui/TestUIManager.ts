import { UIManager, EUIName } from "../../libs/ui/UIManager";
import { AudioMgr, EAudio } from "../../libs/utils/AudioMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TestUIManager extends cc.Component {

    start() {
        UIManager.Inst.init();
        AudioMgr.Inst.playMusic(EAudio.M_BGM);
    }

    openUI() {
        UIManager.Inst.showUI(EUIName.UI1);
    }

    showTip() {

        UIManager.Inst.tipMseeage.showTip("hello world singleTip");
    }

    showTips() {

        UIManager.Inst.tipMseeage.showTips("hello world tips");
        // UIManager.inst.tipMseeage.showTips("hello world tips 2");
    }

    onClick(evt,data){
        if(data==1){
            AudioMgr.Inst.openMusic(true);
            AudioMgr.Inst.openEffect(true);
        }else if(data==2){
            AudioMgr.Inst.openMusic(false);
            AudioMgr.Inst.openEffect(false);
        }else{
            AudioMgr.Inst.playEffect(EAudio.E_CLICK);
        }
    }

    showTipBox() {

        UIManager.Inst.tipMseeage.showTipBox("hello world 666", 2,
            () => {
                console.log("ok");
            },
            () => {
                console.log("cancel");
            }
        );
    }

}
