import * as cc from "cc";
import { PropertyBase } from "../../../mlib/module/ui/property/PropertyBase";
import { MButton } from "../../../mlib/module/ui/extend/MButton";
import { MToggle } from "../../../mlib/module/ui/extend/MToggle";
const { ccclass } = cc._decorator;

@ccclass('UIHUDProperty')
export class UIHUDProperty extends PropertyBase {
    ss:MToggle
}