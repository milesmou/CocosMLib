import { Button, EditBox, Node, ScrollView, _decorator, game } from 'cc';
import { UIComponent } from '../../../mlib/module/ui/manager/UIComponent';
import { MCloudDataSDK } from '../../../mlib/sdk/MCloudDataSDK';
import { CCUtils } from '../../../mlib/utils/CCUtil';
import { GameData } from '../GameData';
import { GMCloudDataItem } from './GMCloudDataItem';
const { ccclass, property } = _decorator;

@ccclass('GMCloudDataMgr')
export class GMCloudDataMgr extends UIComponent {
    private _saveDesc: EditBox;
    private _readPanel: Node;
    private _scrollView: ScrollView;

    private _gmUid = "RebornManGM";

    onLoad() {

        this._readPanel = this.rc.getNode("ReadPanel");
        this._scrollView = this.rc.get("ScrollView", ScrollView);
        this._saveDesc = this.rc.get("SaveName", EditBox);

        this._readPanel.active = false;
    }


    protected onClickButton(btnName: string, btn: Button): void {
        switch (btnName) {
            case "BtnSave":
                this.onClickSave();
                break;
            case "BtnRead":
                this.onClickRead();
                break;
            case "BtnNewGame":
                this.newGame();
                break;
            case "BtnClosePanel":
                this.closeReadPanel();
                break;
            default:
                break;
        }
    }

    /**保存存档 */
    private onClickSave() {
        let desc = this._saveDesc.string.trim();
        if (!desc) {
            desc = new Date().toString();
        }

        let data = GameData.Inst.getSerializeStr();

        MCloudDataSDK.saveGameData(this._gmUid, Date.now().toString(), data, desc).then(v => {
            if (v && v["code"] == 100) {
                app.tipMsg.showToast("存档保存成功");
            } else {
                app.tipMsg.showToast("存档保存失败");
            }
        })
    }

    /**读取存档列表 */
    private onClickRead() {
        this._readPanel.active = true;
        this.renderScrollView();
    }

    /**关闭存档列表 */
    private closeReadPanel() {
        this._readPanel.active = false;
    }

    /**显示列表中的所有存档 */
    private renderScrollView() {
        MCloudDataSDK.getGameDatas(this._gmUid).then(v => {
            if (v && v["code"] == 100) {
                console.log("获取所有存档成功");
                let list = v["data"] as any[];
                CCUtils.loadList(this._scrollView.content, list, (data, item) => {
                    let desc: string = data.commit;
                    let date: string = data.key;
                    let uid: string = data.uid;
                    item.getComponent(GMCloudDataItem).initData(desc, date, this.onClickDelKey.bind(this, uid, date), this.onClickReadKey.bind(this, data));
                });
            } else {
                app.tipMsg.showToast("获取存档失败");
            }
        });

    }

    /**建立新存档 */
    private newGame() {
        app.tipMsg.showConfirm(
            "开启新存档会丢失当前存档，请确保需要保存当前存档!",
            {
                type: 2,
                cbOk: () => {
                    GameData.Inst.replaceGameData("");
                    game.restart();
                }
            });
    }

    /**删除存档 */
    private onClickDelKey(uid: string, key: string) {
        app.tipMsg.showConfirm(
            "删除存档不可逆，真的要删除么？!", {
            type: 2,
            cbOk: () => {
                MCloudDataSDK.delGameData(uid, key).then(v => {
                    if (v && v["code"] == 100) {
                        app.tipMsg.showToast("删除存档成功");
                        this.renderScrollView();
                    } else {
                        app.tipMsg.showToast("删除存档失败");
                    }
                });
            }
        });

    }

    /**读取存档 */
    private onClickReadKey(data: any) {
        app.tipMsg.showConfirm(
            "读取将失去现在的存档，请先确保当前存档保存了", {
            type: 2,
            cbOk: () => {
                try {
                    GameData.Inst.replaceGameData(data.data);
                    game.restart();
                } catch (e) {
                    console.error(e);
                }
            }
        }
        );
    }
}


