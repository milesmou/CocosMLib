import { Input, input } from "cc";
import { EDITOR_NOT_IN_PREVIEW } from "cc/env";

if (EDITOR_NOT_IN_PREVIEW) {
    input.on(Input.EventType.KEY_UP,(evt)=>{
        console.log("KEY_UP",evt.keyCode);
        
    });
    let type = Editor.Selection.getLastSelectedType();
    console.log(1,type);
    
    
    // console.log("hhh11hh");
    // Editor["111"]=222;
    // Editor.Message.send("miles-editor-tool", "setAutoGenPropertyListener", 1);
    // Editor.Selection.()

    // /** 选中节点  */
    // function autoGenPropertyListener(uuid: string) {
    //     // Editor.Message.addBroadcastListener("")
    //     console.log("autoGenPropertyListener",uuid);
        
    // }



    console.log(Editor);
    

}