import { _decorator, Button, Node, ProgressBar } from 'cc';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';
import { UIScrollviewEnhanceProperty } from '../../../gen/property/UIScrollviewEnhanceProperty';
import { CCUtils } from '../../../../mlib/utils/CCUtil';

const { ccclass, property } = _decorator;

@ccclass('UIScrollviewEnhance')
export class UIScrollviewEnhance extends UIBase {

    protected property: UIScrollviewEnhanceProperty;

    protected start(): void {
        let list: number[] = [];
        list.length = 100;
        CCUtils.loadList(this.property.scrollViewSV.content, list);
    }
}