import { Button, Label, _decorator } from 'cc';
import { MButton } from '../../../mlib/module/ui/extend/MButton';
import { UIComponent } from '../../../mlib/module/ui/manager/UIComponent';
import { Utils } from '../../../mlib/utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('GMCloudDataItem')
export class GMCloudDataItem extends UIComponent {

    private _itemName: Label;
    private _itemDate: Label;

    private _onClickDelCb: () => void;
    private _onClickReadCb: () => void;

    protected onLoad(): void {
        this._itemName = this.rc.get("Name", Label);
        this._itemDate = this.rc.get("Date", Label);
    }

    public initData(desc: string, date: string, onClickDelCb: () => void, onClickReadCb: () => void) {
        this._onClickDelCb = onClickDelCb;
        this._onClickReadCb = onClickReadCb;
        this._itemName.string = desc;
        this._itemDate.string = Utils.formatTime("YYYY年MM月DD日 hh:mm:ss", new Date(parseInt(date)));
    }


    protected onClickButton(btnName: string, btn: Button): void {
        switch (btnName) {
            case "DataItem":
                this._onClickReadCb();
                break;
            case "BtnDel":
                this._onClickDelCb();
                break;

            default:
                break;
        }
    }

}


