

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    shade: cc.Node= null;

   

    start () {
        this.shade.setSiblingIndex(1);
    }


}
