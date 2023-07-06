import { Component, Enum, sys, _decorator } from 'cc';
const { ccclass, property } = _decorator;


const ESpecialNodeType = Enum({
    None: 0,
    GM: 1,
    SH: 2,
    Android: 3,
    IOS: 4,
    MiniGame: 5
})

@ccclass('SpecialNode')
export class SpecialNode extends Component {
    @property({
        type: ESpecialNodeType,
        tooltip: "节点的类型"
    })
    type = ESpecialNodeType.None;
    @property({
        tooltip: "反转显示(默认满足条件时显示,反转后满足条件隐藏)"
    })
    reverse = false;

    onLoad() {
        if (this.type == ESpecialNodeType.GM) this.checkGMVisible();
        else if (this.type == ESpecialNodeType.SH) this.checkSHVisible();
        else if (this.type == ESpecialNodeType.Android) this.checkAndroidVisible();
        else if (this.type == ESpecialNodeType.IOS) this.checkIOSVisible();
        else if (this.type == ESpecialNodeType.MiniGame) this.checkMiniGameVisible();
    }

    checkGMVisible() {

    }

    checkSHVisible() {

    }

    checkAndroidVisible() {
        let visible = true;
        if (sys.platform == sys.Platform.ANDROID) {
            visible = !this.reverse;
        }
        else {
            visible = this.reverse;
        }

        this.node.active = visible;
    }

    checkIOSVisible() {
        let visible = true;
        if (sys.platform == sys.Platform.IOS) {
            visible = !this.reverse;
        }
        else {
            visible = this.reverse;
        }

        this.node.active = visible;
    }

    checkMiniGameVisible() {
        let visible = true;
        if (sys.platform == sys.Platform.WECHAT_GAME) {
            visible = !this.reverse;
        }
        else {
            visible = this.reverse;
        }

        this.node.active = visible;
    }
}


