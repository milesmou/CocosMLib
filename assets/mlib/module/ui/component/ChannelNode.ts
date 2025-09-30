import { Component, _decorator } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 按照渠道名控制子节点的显示
 * 只显示节点名字包含渠道名的节点
 * 节点名字以!开始会反转显示
 */
@ccclass('ChannelNode')
export class ChannelNode extends Component {

    protected onLoad(): void {
        let channelName = mGameSetting.channel;
        for (const child of this.node.children) {
            let active = child.name.includes(channelName);
            if (child.name.startsWith("!")) active = !active;
            child.active = active;
        }
    }

}


