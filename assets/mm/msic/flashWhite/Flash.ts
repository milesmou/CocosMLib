const { ccclass, property } = cc._decorator;

@ccclass
export default class Flash extends cc.Component {

    @property()
    duration: number = 0.5;

    _median: number = 0;
    _time: number = 0;

    _material: cc.Material = null;

    spine: sp.Skeleton = null;

    onLoad() {
        this.duration = 0.2;
        this._median = this.duration / 2;
        //获取材质
        if (this.node.getComponent(cc.Sprite)) {
            this._material = this.node.getComponent(cc.Sprite).getMaterial(0);
        } else {
            this.spine = this.node.getComponent(sp.Skeleton);
            this._material = this.spine.getMaterial(0);
        }
        //设置材质对应的属性
        this._material.setProperty("u_rate", 1);
        this.spine && this.spine["_updateMaterial"]();
    }

    update(dt) {
        if (this.Grayed) return;
        if (this._time > 0) {
            this._time -= dt;
            this._time = this._time < 0 ? 0 : this._time;
            let rate = Math.abs(this._time - this._median) * 2 / this.duration;
            this._material.setProperty("u_rate", rate);
            this.spine && this.spine["_updateMaterial"]();
        }
    }

    clickFlash() {
        this._time = this.duration;
    }

    private _grayed = false;
    get Grayed() {
        return this._grayed;
    }
    set Grayed(value: boolean) {
        this._grayed = value;
        if (value) {
            this.spine && (this.spine.timeScale = 0);
            this._material.setProperty("u_color", cc.color(0, 0, 0, 255));
            this._material.setProperty("alphaThreshold", 1);
            this._material.setProperty("u_rate", 0.1);
            this.spine && this.spine["_updateMaterial"]();
        } else {
            this.spine && (this.spine.timeScale = 1);
            this._material.setProperty("u_color", cc.color(255, 255, 255, 255));
            this._material.setProperty("alphaThreshold", 0.5);
            this._material.setProperty("u_rate", 1);
            this.spine && this.spine["_updateMaterial"]();
        }
    }
}