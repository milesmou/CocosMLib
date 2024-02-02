import { ScrollView, _decorator } from 'cc';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';
import { CCUtils } from '../../../../mlib/utils/CCUtil';

const { ccclass, property } = _decorator;

@ccclass('UIScrollviewEnhance')
export class UIScrollviewEnhance extends UIBase {

    protected start(): void {
        let list: number[] = [];
        list.length = 100;
        let sc = this.rc.get("ScrollView", ScrollView);
        CCUtils.loadList(sc.content, list);
    }
}