import { EUIName, UIManager } from "../../libs/ui/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestGuide extends cc.Component {

    start(){
        UIManager.inst.init().then(()=>{
            UIManager.inst.openUI(EUIName.UI3);
        })
        
    }
}
