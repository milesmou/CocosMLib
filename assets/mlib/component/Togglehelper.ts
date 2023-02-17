import { _decorator, Component, Node, Toggle } from 'cc';
const { ccclass, property } = _decorator;

/** Toggle选中时隐藏背景 */
@ccclass("Togglehelper")
export class Togglehelper extends Component {
    @property({
        type: Node,
        displayName: "背景节点",
        tooltip: "选中时隐藏背景",
        visible: function () { return (this as Component).getComponent(Toggle) != null }
    })
    bg: Node | null = null;

    onLoad() {
        if (this.bg) {
            this.node.on("toggle", this.onToggle, this);
            this.onToggle(this.getComponent(Toggle)!);
        }
    }

    onToggle(toggle: Toggle) {
        if (!this.bg) return;
        this.bg.active = !toggle.isChecked;
    }
}