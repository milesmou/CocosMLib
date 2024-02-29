import { Button, EditBox, Node, Toggle, _decorator } from 'cc';
import { App } from '../../../mlib/App';
import { UIBase } from '../../../mlib/module/ui/manager/UIBase';
import { EventKey } from '../GameEnum';
import { PlayerData } from '../PlayerData';
const { ccclass, property } = _decorator;

@ccclass('UIGM')
export class UIGM extends UIBase {

    private _togs: Node;

    protected onLoad(): void {
        this.initToggles();
    }

    private initToggles() {
        let togs = this._togs.getComponentsInChildren(Toggle);
        let togMap: Map<string, Toggle> = new Map();
        togs.forEach(v => togMap.set(v.node.name.trim(), v));
    }

    private onToggle(tog: Toggle) {
        switch (tog.node.name) {
            case "PrintJi":
                break;
            default:
                break;
        }
    }


    protected onClickButton(btnName: string, btn: Button): void {
        switch (btnName) {
            case "BtnAddItem":
                this.onClickAddItem(btn);
                break;

            default:
                break;
        }
    }


    private onClickAddItem(btn: Button) {
        let node = btn.node.parent;

        let editBoxs = node.getComponentsInChildren(EditBox);

        let _itemId = +editBoxs[0].string;
        let _itemNum = +editBoxs[1].string;;
        if (typeof _itemId != "number" || typeof _itemId != "number") {
            App.tipMsg.showToast("咱就说起码得输入数字吧");
            return;
        }
        if (!_itemId || !_itemNum) {
            App.tipMsg.showToast("请输入ID和数量");
            return;
        }
        // if (!GameTable.Inst.Table.TbItem.get(+_itemId)) {
        //     App.tipMsg.showToast("请输入正确的道具ID");
        //     return;
        // }
        if (_itemNum > 0) {
            PlayerData.Inst.getReward([+_itemId, +_itemNum]);
            App.tipMsg.showToast("添加道具成功");
        } else {
            PlayerData.Inst.delCost([_itemId, Math.abs(_itemNum)])
            App.tipMsg.showToast("删除道具成功");
        }
        App.event.emit(EventKey.OnInventoryChange);

    }
}


