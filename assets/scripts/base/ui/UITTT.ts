
import { _decorator, Node } from 'cc';
import { UIBase } from '../../../mlib/module/ui/manager/UIBase';
import { UIHUDProperty } from '../../gen/property/UIHUDProperty';

const { ccclass, property } = _decorator;

@ccclass('UITTT')
export class UITTT extends UIBase {

    protected propertys: UIHUDProperty;

    onLoad() {
        super.onLoad();
        this.propertys = new UIHUDProperty(this.node);
    }
}


