import { Component } from "cc";
import { persistNode } from "../../../mlib/module/core/Decorator";

@persistNode
export class UIPreload extends Component {
    public static Inst: UIPreload;
    
    
    
    protected onLoad(): void {
        UIPreload.Inst = this;
    }



}