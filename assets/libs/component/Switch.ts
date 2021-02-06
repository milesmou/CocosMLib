const { ccclass, property } = cc._decorator;
/** 对组件所在节点的子节点做显隐处理，子节点索引在checkIndex中的显示，其余的隐藏 */
@ccclass
export default class Switch extends cc.Component {

    @property
    private checkIndex: number[] = [];

    onLoad() {
        this.updateContent();
    }

    /** 更新显示状态 */
    private updateContent() {
        this.node.children.forEach((v, i) => {
            v.active = this.checkIndex.includes(i);
        });
    }

    /** 更新CheckNode */
    updateCheck(...childIndex: number[]) {
        this.checkIndex = childIndex;
        this.updateContent();
    }

}
