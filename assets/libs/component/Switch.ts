const { ccclass, property } = cc._decorator;

/** 开关组件，用于控制子节点之间的显隐关系 */
@ccclass
export default class Switch extends cc.Component {

    @property({
        tooltip: "是否显示指定的CheckNode"
    })
    isChecked = true;
    @property({
        tooltip: "CheckNode与其它兄弟节点显示状态是否互斥，即当CheckNode显示时隐藏所有兄弟节点"
    })
    mutex = true;
    @property(cc.Node)
    private checkNode: cc.Node = null;

    onLoad(){
        this.updateContent();
    }

    /** 更新显示状态 */
    updateContent() {
        this.node.children.forEach(v => {
            if (v == this.checkNode) {
                v.active = true;
            } else {
                if (this.mutex) {
                    v.active = false;
                }
            }
        });
    }

    /** 更新CheckNode */
    updateCheck(index: number) {
        this.checkNode = this.node.children[index];
        this.updateContent();
    }

}
