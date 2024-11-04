import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Switch')
export class Switch extends Component {
    @property
    checkIndex: number[] = [];

    protected onLoad() {
        this.updateContent();
    }

    /** 更新显示状态 */
    private updateContent() {
        this.node.children.forEach((v, i) => {
            v.active = this.checkIndex.includes(i);
        });
    }

    /** 更新CheckNode */
    public updateCheck(...childIndex: number[]) {
        this.checkIndex = childIndex;
        this.updateContent();
    }

    /** 通过节点名字更新显示的节点 */
    public updateCheckByName(...names: string[]) {
        this.node.children.forEach((v, i) => {
            v.active = names.includes(v.name);
        });
    }
}
