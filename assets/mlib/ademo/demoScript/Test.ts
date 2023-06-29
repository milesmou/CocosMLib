import { _decorator, Component, Node, SpriteFrame, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    @property(Sprite)
    sp: Sprite;
    @property(SpriteFrame)
    spF: SpriteFrame;
    start() {
        this.scheduleOnce(()=>{
            this.sp.spriteFrame = this.spF;
        },3);
    }

    update(deltaTime: number) {

    }
}


