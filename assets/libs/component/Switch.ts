const { ccclass, property } = cc._decorator;
/** 所在节点的子节点做开关处理，当CheckNode显示时隐藏它所有兄弟节点 */
@ccclass
export default class Switch extends cc.Component {

    @property({
        type: cc.Node,
        tooltip: "默认显示的节点"
    })
    private checkNode: cc.Node = null;

    onLoad() {
        this.updateContent();
    }

    /** 更新显示状态 */
    private updateContent() {
        this.node.children.forEach(v => {
            if (v == this.checkNode) {
                v.active = true;
            } else {
                v.active = false;
            }
        });
    }

    /** 更新CheckNode */
    updateCheck(childIndex: number) {
        this.checkNode = this.node.children[childIndex];
        this.updateContent();
    }

}
