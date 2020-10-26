import { EUIName, UIManager } from "../../libs/ui/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestGuide extends cc.Component {

    start(){
        UIManager.Inst.init().then(()=>{
            UIManager.Inst.openUI(EUIName.UI3);
        })
        
    }
}
