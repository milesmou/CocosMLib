import * as cc from "cc";
import { PropertyBase } from "../../../mlib/module/ui/property/PropertyBase";

export class UIHUDProperty extends PropertyBase {
    public get node222Tf() { return this.getComp("$Node222", cc.UITransform); }
}