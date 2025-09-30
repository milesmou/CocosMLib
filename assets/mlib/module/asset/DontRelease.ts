import { _decorator, Component } from "cc";
const { ccclass, property } = _decorator;


/** 标记当前节点不需要释放依赖资源 */
@ccclass("DontRelease")
export class DontRelease extends Component {
}
