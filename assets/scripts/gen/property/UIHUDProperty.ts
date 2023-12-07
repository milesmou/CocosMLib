import * as cc from "cc";
import { MButton } from "../../../mlib/module/ui/extend/MButton";
import { MToggle } from "../../../mlib/module/ui/extend/MToggle";
import { PropertyBase } from "../../../mlib/module/ui/property/PropertyBase";
const { ccclass } = cc._decorator;

@ccclass('UIHUDProperty')
export class UIHUDProperty extends PropertyBase {
    public get progressBarTf() { return this.getComp("$ProgressBar", cc.UITransform); }
    public get progressBarSp() { return this.getComp("$ProgressBar", cc.Sprite); }
    public get progressBarPBar() { return this.getComp("$ProgressBar", cc.ProgressBar); }
}