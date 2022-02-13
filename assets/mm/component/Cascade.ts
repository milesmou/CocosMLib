const { ccclass, property, menu } = cc._decorator;

/** 将某些节点的属性与指定节点属性关联(默认与组件所在节点关联)*/
@ccclass
@menu("MM/Cascade")
export default class Cascade extends cc.Component {


    @property(cc.Node)
    origin: cc.Node = null;
    @property(cc.Node)
    targets: cc.Node[] = [];

    @property
    syncActive = false;
    @property
    syncOpacity = false;
    @property
    syncScale = false;

    protected onLoad(): void {
        if (!this.origin) {
            this.origin = this.node;
        }
    }

    protected update(dt: number): void {
        this.targets.forEach(v => {
            if (this.syncActive) {
                v.active = this.origin.active;
            }
            if (this.syncOpacity) {
                v.opacity = this.origin.opacity;
            }
            if (this.syncScale) {
                v.scaleX = this.origin.scaleX;
                v.scaleY = this.origin.scaleY;
            }
        });
    }
}
