import { _decorator, Component, Node } from 'cc';
import { UIContainerItem } from '../mlib/module/ui/manager/UIContainerItem';
const { ccclass, property } = _decorator;

@ccclass('NewComponent')
export class NewComponent extends UIContainerItem {
    onLoad() {
        super.onLoad();
    }

    initData() {

    }
}


