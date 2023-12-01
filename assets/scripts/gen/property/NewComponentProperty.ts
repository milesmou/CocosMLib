import * as cc from "cc";
import { PropertyBase } from "../../../mlib/module/ui/property/PropertyBase";

export class NewComponentProperty extends PropertyBase {
    public get node1() { return this.getNode("$Node1"); }
}