import * as cc from "cc";
import { PropertyBase } from "../../../mlib/module/ui/property/PropertyBase";

export class UIHUDProperty extends PropertyBase {
    public get node11Tf() { return this.getComp("$Node11", cc.UITransform); }
}