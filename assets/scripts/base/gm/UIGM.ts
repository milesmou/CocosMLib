import { Button, EditBox, Label, Node, _decorator, game, profiler } from 'cc';
import { ELoggerLevel } from 'db://assets/mlib/module/logger/ELoggerLevel';
import { MToggle } from 'db://assets/mlib/module/ui/extend/MToggle';
import { HttpGameData } from 'db://assets/mlib/sdk/GameWeb/GameData/HttpGameData';
import { UIBase } from '../../../mlib/module/ui/manager/UIBase';
import { FengHaoCtrl } from '../../game/FengHaoCtrl';
import { GameTool } from '../../game/GameTool';
import { UIConstant } from '../../gen/UIConstant';
import { UIFlyGold } from '../../ui/common/UIFlyGold';
import { GuildModel } from '../../ui/guild/GuildModel';
import { giftBagCtrl } from '../../ui/shop/giftBagCtrl';
import { LimitedModel } from '../../ui/shop/Item/LimitedModel';
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

    private get m_noAdStage() { return this.rc.get("noAdStage", Label); }
    private get m_qunShareStage() { return this.rc.get("qunShareStage", Label); }

    private get togs() { return this.rc.get("Togs", Node); }
    private get channelName() { return this.rc.get("ChannelName", Label); }


    onEnable() {
        this.inintShow();
        this.channelName.string = mGameSetting.channel;
    }

    protected onLoad(): void {
        this.initToggles();
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
        let togs = this.togs.getComponentsInChildren(MToggle);
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
            case "BtnClosAct":
                this.onClickCloseAct(btn);
                break;
            case "BtnAFinishGuide":
                this.onClickFinishGuide(btn);
                break;
            case "showGmBtn":
                this.closeGmBtn();
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
            case "clearHealth":
                LimitedModel.Inst.save(3001, 0);
                app.tipMsg.showToast("清空了无限体力");
                break;
            case "BtnJumpStage":
                //跳关
                // const chapter = NodeHelper.findChildrenByNameOnce(this.node, "JLGM_EditBox")?.getComponent(EditBox);
                // const stage = NodeHelper.findChildrenByNameOnce(this.node, "JLGM_EditBox2")?.getComponent(EditBox);
                // const star = NodeHelper.findChildrenByNameOnce(this.node, "JLGM_EditBox3")?.getComponent(EditBox);
                // let jump = StageModel.Inst.gmJump(parseInt(chapter.string), parseInt(stage.string), parseInt(star.string));
                // if (jump) {
                //     this.scheduleOnce(() => {
                //         game.restart();
                //     })
                // }
                break;
            case "jieFeng1":
                //正常解封，还会监管
                FengHaoCtrl.jieFeng(0, true);
                break;
            case "jieFeng2":
                //霸道解封，并且不再监管了
                FengHaoCtrl.jieFeng(999, true);
                break;
            case "fengHao":
                //封号
                FengHaoCtrl.fengHao();
                break;
            case "upPlayerBtn":
                //强制上传这个玩家的数据到服务器
                this.updateThePlayerInfo(btn);
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
            //飞金币
            UIFlyGold.flyProps(_itemId, {
                from: this.node,
                itemCount: 1,
                myScale: 1,
                itemNum: _itemNum,
            })
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

    private onClickCloseAct(btn: Button) {
        let node = btn.node.parent;

        let editBoxs = node.getComponentsInChildren(EditBox);

        let _actId = +editBoxs[0].string;

        if (typeof _actId != "number" || typeof _actId != "number") {
            app.tipMsg.showToast("咱就说起码得输入数字吧");
            return;
        }

        if (giftBagCtrl.Inst.isGiftOpen(_actId)) {
            giftBagCtrl.Inst.closeGiftCheck(_actId)
            app.tipMsg.showToast("活动关闭");
        } else {
            app.tipMsg.showToast("这个活动并未开启");
        }

    }

    /** 关闭GM按钮 */
    private closeGmBtn() {
        mGameConfig.closeGM();
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

    /** 是否是掌趣游云存档的渠道 */
    private isZQYChannel() {
        let channelId = mGameSetting.channelId;
        return channelId == EChannel.WX_ZQY || channelId == EChannel.WX_YXT || channelId == EChannel.DY_ZQY || channelId == EChannel.DY_YXT2;
    }

    private onClickCloudData(root: Node, isDownload: boolean) {
        let editBox = root.getComponentInChildren(EditBox);


        let uid = editBox.string.trim();

        if (!uid) {
            app.tipMsg.showToast("请填入UID");
            return;
        }

        if (isDownload) {

            let cb = (v: HttpGameDataModel.RspPlayerGameData) => {
                if (v.data) {
                    app.tipMsg.showConfirm("是否使用该用户【云端存档】覆盖【本地存档】？", {
                        type: 2, cbOk: () => {
                            GameData.replaceGameData(v.data);
                            game.restart();
                        },
                    })
                } else {
                    app.tipMsg.showToast("存档未找到");
                }
            }


            if (this.isZQYChannel())
                ZhiQuCloudData.getGameData(uid, mGameSetting.channelId).then(cb);
            else
                HttpGameData.getPlayerGameData({ userId: uid }).then(v => {
                    if (v?.code == 0) {
                        cb(v.data);
                    } else {
                        app.tipMsg.showToast("存档未找到");
                    }
                });
        } else {

            //KIN 一个土质密码机制

            let _call = () => {
                let cb = v => {
                    if (v) {
                        app.tipMsg.showToast("替换用户云端存档成功，用户重新打开游戏后生效");
                    } else {
                        app.tipMsg.showToast("上传存档失败");
                    }
                }
                app.tipMsg.showConfirm("是否使用【本地存档】覆盖指定用户的【云端存档】？该用户需要关闭游戏后再覆盖，否则可能失败！", {
                    type: 2, cbOk: () => {
                        if (this.isZQYChannel()) ZhiQuCloudData.saveGameData(uid, GameData.Inst.getSerializeStr(), mGameSetting.channelId).then(cb);
                        else HttpGameData.savePlayerGameData({ userId: uid, data: GameData.Inst.getSerializeStr() }).then(cb);
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

    /**紧急上传这个玩家的信息到服务器，注意渠道需要对应上，处理服务器拉取数据为NULL的BUG */
    private async updateThePlayerInfo(btn: Button) {
        let node = btn.node.parent;
        let editBoxs = node.getComponentsInChildren(EditBox);
        let _userId = editBoxs[0].string;;

        GuildModel.Inst.httpUpdateMyPlayerInfo(_userId);

    }

}


