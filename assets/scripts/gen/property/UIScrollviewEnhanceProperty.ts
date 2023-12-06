import * as cc from "cc";
import { PropertyBase } from "../../../mlib/module/ui/property/PropertyBase";
const { ccclass } = cc._decorator;

@ccclass('UIScrollviewEnhanceProperty')
export class UIScrollviewEnhanceProperty extends PropertyBase {
    public get scrollViewTf() { return this.getComp("$ScrollView", cc.UITransform); }
    public get scrollViewSp() { return this.getComp("$ScrollView", cc.Sprite); }
    public get scrollViewSV() { return this.getComp("$ScrollView", cc.ScrollView); }
}