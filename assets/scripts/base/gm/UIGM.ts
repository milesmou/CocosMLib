import { Button, EditBox, Label, Node, _decorator, profiler } from 'cc';
import { ELoggerLevel } from 'db://assets/mlib/module/logger/ELoggerLevel';
import { Dropdown } from 'db://assets/mlib/module/ui/extend/Dropdown';
import { MToggle } from 'db://assets/mlib/module/ui/extend/MToggle';
import { UIBase } from '../../../mlib/module/ui/manager/UIBase';
import { GameTool } from '../../game/GameTool';
import { UIConstant } from '../../gen/UIConstant';
import { UIFlyGold } from '../../ui/common/UIFlyGold';
import { GameData } from '../GameData';
import { EventKey } from '../GameEnum';
import GameTable from '../GameTable';
import { GameGuide } from '../guide/GameGuide';
import { PlayerData } from '../PlayerData';
import { EChannel } from '../publish/EChannel';
import { ZhiQuCloudData } from '../publish/sdk/ZhiQuCloudData';
const { ccclass, property } = _decorator;

@ccclass('UIGM')
export class UIGM extends UIBase {

    private get m_gmBtgShowStage() { return this.rc.get("showStage", Label); }
    private get m_noAdStage() { return this.rc.get("noAdStage", Label); }
    private get m_qunShareStage() { return this.rc.get("qunShareStage", Label); }

    private _togs: Node;

    onEnable() {
        this.inintShow();
    }

    protected onLoad(): void {
        this._togs = this.rc.get("Togs", Node);
        this.initToggles();

        //是否显示GM的显示初始化
        if (GameData.Inst.isShowGmBtns) {
            this.m_gmBtgShowStage.string = "显示";
        } else {
            this.m_gmBtgShowStage.string = "隐藏";
        }

    }

    inintShow() {
        //去广告礼包的显示初始化
        if (GameData.Inst.vipStage.isNoChaAd) {
            this.m_noAdStage.string = "买了";
        } else {
            this.m_noAdStage.string = "没买";
        }

        //群分享状态初始化
        if (GameData.Inst.todayHaveGetQunShareReward) {
            this.m_qunShareStage.string = "领了";
        } else {
            this.m_qunShareStage.string = "没领";
        }
    }

    private initToggles() {
        let togs = this._togs.getComponentsInChildren(MToggle);
        let togMap: Map<string, MToggle> = new Map();
        togs.forEach(v => {
            togMap.set(v.node.name.trim(), v);
            v.onValueChange.addListener(this.onToggle, this);
        });
    }

    private onToggle(tog: MToggle) {
        switch (tog.node.name) {
            case "FPS":
                if (tog.isChecked) profiler.showStats();
                else profiler.hideStats();
                break;
            case "Log":
                if (tog.isChecked) mLogger.setLevel(ELoggerLevel.Debug);
                else mLogger.setLevel(ELoggerLevel.Info);;
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
            case "BtnAddGold":
                this.onClickAddGold(btn);
                break;
            case "BtnAddDiamond":
                this.onClickAddDiamond(btn);
                break;
            case "BtnAFinishGuide":
                this.onClickFinishGuide(btn);
                break;
            case "showGmBtn":
                this.showGmBtn();
                break;
            case "delNoAd":
                this.delNoAdVip();
                break;
            case "BtnDownload":
                this.onClickCloudData(btn.node.parent, true);
                break;
            case "BtnUpload":
                this.onClickCloudData(btn.node.parent, false);
                break;
            case "qunShare":
                GameData.Inst.todayHaveGetQunShareReward = false;
                GameData.Inst.delaySave();
                this.inintShow();
                break;
            case "budanbtn":
                this.buDan(btn);
                break;
            case "budanbtn":
                this.buDan(btn);
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
        if (typeof _itemId != "number" || typeof _itemNum != "number") {
            app.tipMsg.showToast("咱就说起码得输入数字吧");
            return;
        }
        if (!_itemId || !_itemNum) {
            app.tipMsg.showToast("请输入ID和数量");
            return;
        }
        if (!GameTable.Table.TbItem.get(+_itemId)) {
            app.tipMsg.showToast("没这道具");
            return;
        }

        if (_itemId == 1 || _itemId == 2 || _itemId == 101) {
            app.tipMsg.showToast("不能加金币和钻石");
            return;
        }

        if (_itemNum > 0) {
            PlayerData.Inst.getReward([+_itemId, +_itemNum]);
            app.tipMsg.showToast("添加道具成功");
        } else {
            PlayerData.Inst.delCost([_itemId, Math.abs(_itemNum)])
            app.tipMsg.showToast("删除道具成功");
        }
        app.event.emit(EventKey.OnInventoryChange);

    }

    private onClickAddGold(btn: Button) {
        let node = btn.node.parent;

        let editBoxs = node.getComponentsInChildren(EditBox);

        let _itemNum = +editBoxs[0].string;;
        if (typeof _itemNum != "number") {
            app.tipMsg.showToast("咱就说起码得输入数字吧");
            return;
        }
        if (!_itemNum) {
            app.tipMsg.showToast("请输入数量");
            return;
        }
        if (_itemNum > 0) {
            PlayerData.Inst.AddMoney(_itemNum);
            app.tipMsg.showToast("添加金币成功");
            UIFlyGold.flyProps(1, {
                from: this.node, itemCount: 5, myScale: 1, itemNum: _itemNum
            })
        } else {
            PlayerData.Inst.AddMoney(_itemNum, { willDead: true });
            app.tipMsg.showToast("减少金币成功");
        }
        app.event.emit(EventKey.OnInventoryChange);

    }

    private onClickAddDiamond(btn: Button) {
        let node = btn.node.parent;

        let editBoxs = node.getComponentsInChildren(EditBox);

        let _itemNum = +editBoxs[0].string;;
        if (typeof _itemNum != "number") {
            app.tipMsg.showToast("咱就说起码得输入数字吧");
            return;
        }
        if (!_itemNum) {
            app.tipMsg.showToast("请输入数量");
            return;
        }
        if (_itemNum > 0) {
            PlayerData.Inst.AddDiamond(_itemNum);
            app.tipMsg.showToast("添加钻石成功");
            UIFlyGold.flyProps(2, {
                from: this.node, itemCount: 5, myScale: 1, itemNum: _itemNum
            })
        } else {
            PlayerData.Inst.delCost([2, Math.abs(_itemNum)])
            app.tipMsg.showToast("减少钻石成功");
        }
        app.event.emit(EventKey.OnInventoryChange);

    }


    private onClickFinishGuide(btn: Button) {
        let node = btn.node.parent;

        let editBox = node.getComponentInChildren(EditBox);

        let _guideId = +editBox.string;

        if (typeof _guideId != "number" || typeof _guideId != "number") {
            app.tipMsg.showToast("咱就说起码得输入数字吧");
            return;
        }

        if (GameTable.Inst.guideGroup.get(_guideId)) {
            GameGuide.Inst.finisheGuide(_guideId);
            app.tipMsg.showToast("已完成引导" + _guideId);
        } else {
            app.tipMsg.showToast("引导不存在");
        }

    }

    /**显示和隐藏GM按钮 */
    private showGmBtn() {
        if (GameData.Inst.isShowGmBtns) {
            //开，切换成关
            GameData.Inst.isShowGmBtns = false;
            this.m_gmBtgShowStage.string = "隐藏";
            app.tipMsg.showToast("现在隐藏了GM按钮");
        } else {
            //关，切换成开
            GameData.Inst.isShowGmBtns = true;
            app.tipMsg.showToast("现在显示了GM按钮");
            this.m_gmBtgShowStage.string = "显示";
        }
        GameData.Inst.delaySave();
        app.event.emit(EventKey.gmBtnSatgeChaned);
    }

    /**恢复广告，去掉已经购买的去广告礼包 */
    private delNoAdVip() {
        GameData.Inst.vipStage.isNoChaAd = false;
        delete GameData.Inst.giftBagStage.haveBuyData[5000];
        delete GameData.Inst.giftBagStage.haveBuyData[5001];
        GameData.Inst.delaySave();
        this.m_noAdStage.string = "没买";
        app.tipMsg.showToast("恢复了去广告礼包，去掉了去广告特权");
        app.event.emit(EventKey.ChongQianLa);
    }


    private onClickCloudData(root: Node, isDownload: boolean) {
        let dropdown = root.getComponentInChildren(Dropdown);
        let editBox = root.getComponentInChildren(EditBox);

        let channelName = dropdown.stringValue;

        let uid = editBox.string.trim();
        let channelId = EChannel[channelName];
        if (channelId === undefined) {
            app.tipMsg.showToast("未知的渠道");
            return;
        }
        if (!uid) {
            app.tipMsg.showToast("请填入UID");
            return;
        }

        if (isDownload) {
            ZhiQuCloudData.getGameData(uid, channelId).then(v => {
                if (v.data) {
                    app.tipMsg.showConfirm("是否使用该用户【云端存档】覆盖【本地存档】？", {
                        type: 2, cbOk: () => {
                            GameData.replaceGameData(v.data);
                            app.chan.restartGame();
                        },
                    })
                } else {
                    app.tipMsg.showToast("存档未找到");
                }
            });
        } else {

            //KIN 一个土质密码机制

            let _call = () => {
                app.tipMsg.showConfirm("是否使用【本地存档】覆盖指定用户的【云端存档】？该用户需要关闭游戏后再覆盖，否则可能失败！", {
                    type: 2, cbOk: () => {
                        ZhiQuCloudData.saveGameData(uid, GameData.Inst.getSerializeStr(), channelId).then(v => {
                            if (v) {
                                app.tipMsg.showToast("替换用户云端存档成功，用户重新打开游戏后生效");
                            } else {
                                app.tipMsg.showToast("上传存档失败");
                            }
                        });
                    },
                })
            }

            app.ui.show(UIConstant.codeBookKin, { args: [_call, "112"] });


        }
    }

    private buDan(btn: Button) {
        let node = btn.node.parent;

        let editBoxs = node.getComponentsInChildren(EditBox);

        let _shopId = +editBoxs[0].string;;
        if (typeof _shopId != "number") {
            app.tipMsg.showToast("咱就说起码得输入数字吧");
            return;
        }
        if (!_shopId) {
            app.tipMsg.showToast("请输入商品ID");
            return;
        }

        GameTool.buDanByShopId(_shopId);

    }

}


