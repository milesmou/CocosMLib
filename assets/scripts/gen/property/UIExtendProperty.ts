import * as cc from "cc";
import { MButton } from "../../../mlib/module/ui/extend/MButton";
import { MToggle } from "../../../mlib/module/ui/extend/MToggle";
import { PropertyBase } from "../../../mlib/module/ui/property/PropertyBase";
const { ccclass } = cc._decorator;

@ccclass('UIExtendProperty')
export class UIExtendProperty extends PropertyBase {
    public get toggleGroupTC() { return this.getComp("Label-003/$ToggleGroup", cc.ToggleContainer); }
}