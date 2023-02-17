import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Switch')
export class Switch extends Component {
    @property
    checkIndex: number[] = [];

    onLoad() {
        this.updateContent();
    }

    /** 更新显示状态 */
    private updateContent() {
        this.node.children.forEach((v, i) => {
            v.active = this.checkIndex.indexOf(i) > -1;
        });
    }
    /** 更新CheckNode */
    updateCheck(...childIndex: number[]) {
        this.checkIndex = childIndex;
        //游戏中使用了多个字体可能会造成显示异常 
        this.scheduleOnce(() => {
            this.updateContent();
        })
    }
}
