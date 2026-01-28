import { PayParams, PayResult, SDKCallback } from "db://assets/mlib/sdk/SDKWrapper/SDKCallback";
import { MProductDetail } from "../../../mlib/sdk/SDKWrapper/MProductDetail";
import { Utils } from "../../../mlib/utils/Utils";
import { GameTool } from "../../game/GameTool";
import { UIConstant } from "../../gen/UIConstant";
import { dressTools } from "../../ui/dress/dressTools";
import { GuildModel } from "../../ui/guild/GuildModel";
import { myHomeTools } from "../../ui/myHome/myHomeTools";
import { giftBagCtrl } from "../../ui/shop/giftBagCtrl";
import { GameData } from "../GameData";
import { EventKey } from "../GameEnum";
import GameTable from "../GameTable";
import { GameTemp } from "../GameTemp";
import { PlayerData } from "../PlayerData";
import { EChannel } from "../publish/EChannel";
import { EasDataCollect } from "../publish/sdk/easdata/EasDataCollect";

interface ProductInfo {
    /** 商品Id(表里的IAP ID，平台后台填写的IAP ID（如果有）) */
    productId: string;
    /** 自定义游戏订单Id */
    orderId?: string;
    /** 商品表唯一Id（表里的商品ID shopID） */
    id?: string;
}


/** 统一处理内购 */
export class ShopUtil {

    private static isInit;

    /** 脚本加载时自动执行 */
    protected static init = (() => {
        SDKCallback.onInitPay = this.initPurchase.bind(this);
    })();

    /** 请在合适的时机调用，可能会有延迟到账的商品 */
    private static initPurchase() {
        if (this.isInit) return;
        this.isInit = true;
        SDKCallback.payListener = this;
        this.initShopTable();
        this.reqProductDetail();
        app.chan.restorePay();
    }

    /** 初始化商城商品表 */
    private static initShopTable() {
        let list = GameTable.Table.TbStore.getDataList();
        if (mGameSetting.channelId == EChannel.AZCN_YB) {
            list.forEach(v => {
                (v as any).IAPID = v.AZCNYBIAP;
            });
        }
    }

    /** 获取商品详情 */
    private static reqProductDetail() {
        if (MProductDetail.productDetailMap) return;
        let ids: string[] = [];
        // let list1 = GameTable.Table.TbStore.getDataList();
        // list1.forEach(v => {
        //     if (v.IAPID) ids.push(v.IAPID);
        // });
        // let list2 = GameTable.Table.TbGiftBag.getDataList();
        // list2.forEach(v => {
        //     if (v.IAPID) ids.push(v.IAPID);
        // });
        app.chan.reqProductDetails(ids.join("|"));
        app.timer.scheduleOnceM(this.reqProductDetail.bind(this), this, 5);
    }



    /** 从后台获取商品详情 default:使用数据表的商品详情*/
    public static onGetProducts(content: string) {
        mLogger.debug("onGetProductDetail");
        try {
            if (content == "default") {
                MProductDetail.productDetailMap = new Map();
                // let list1 = GameTable.Table.TbStore.getDataList();
                // list1.forEach(v => {
                //     if (v.IAPID) {
                //         let p = new ProductDetail();
                //         p.productId = v.IAPID;
                //         p.isSub = false;
                //         p.name = v.Des;
                //         p.desc = v.Des;
                //         p.formattedPrice = v.Symbol + "" + v.Price;
                //         ProductDetail.productDetailMap.set(p.productId, p);
                //     }
                // });
                // let list2 = GameTable.Table.TbGiftBag.getDataList();
                // list2.forEach(v => {
                //     if (v.IAPID) {
                //         let p = new ProductDetail();
                //         p.productId = v.IAPID;
                //         p.isSub = false;
                //         p.formattedPrice = v.Symbol + "" + v.Price;
                //         ProductDetail.productDetailMap.set(p.productId, p);
                //     }
                // });

            } else {
                let arr: MProductDetail[] = JSON.parse(content);
                MProductDetail.productDetailMap = new Map();
                for (const v of arr) {
                    MProductDetail.productDetailMap.set(v.productId, v);
                }
            }

        } catch (error) {
            mLogger.error(error);
        }
    }

    public static onStartPay(args: PayParams) {
        // UIWait.Inst.show();
        let _shopData = GameTool.getOneShopDataByIapIdOrShopId(args.productId);
        //兼容抖音的小额，找不到数据不管，因为小额就是没配置IAP ID
        if (!_shopData) return;
        //开始支付
        let _shopName = _shopData.Des;
        app.chan.reportEvent(mReportEvent.iap_start, { k: _shopName });
        //数数打点，注意，传的商品名
        app.chan.reportEvent(mReportEvent.iap_start, { Shop_Name: _shopName }, "SS");
    }

    public static onPayResult(result: PayResult) {
        mLogger.debug("onPurchaseUpdate:", result.code, result.productId);
        let _shopData = GameTool.getOneShopDataByIapIdOrShopId(result.productId);
        //兼容抖音的小额，找不到数据不管，因为小额就是没配置IAP ID
        if (!_shopData) return;

        let _shopName = _shopData.Des;
        switch (result.code) {
            case 0:
                this.purchaseSuccess({ productId: result.productId, orderId: result.orderId, id: result.id }, true);
                break;
            case 1:
                // app.ui.showToast("IAP0004", true);//支付失败
                app.chan.reportEvent(mReportEvent.iap_fail, { k: _shopName });
                app.chan.reportEvent(mReportEvent.iap_fail, { Shop_Name: _shopName }, "SS");
                break;
            case 2:
                // app.ui.showToast("IAP0001", true);
                app.chan.reportEvent(mReportEvent.iap_fail, { k: _shopName });
                //数数打点，注意，传的商品名
                app.chan.reportEvent(mReportEvent.iap_fail, { Shop_Name: _shopName }, "SS");
                break;
            case 3:
                app.tipMsg.showToast("验证失败，支付结果可能会有延迟");//验证失败，支付结果可能会有延迟
                break;

            case 5:
                // app.ui.showToast("IAP0002", true);
                app.chan.reportEvent(mReportEvent.iap_fail, { k: _shopName });
                app.chan.reportEvent(mReportEvent.iap_fail, { Shop_Name: _shopName }, "SS");
                break;
            case 6:
                this.purchaseSuccess({ productId: result.productId, orderId: result.orderId, id: result.id }, false);
                break;
            default:
                break;
        }
    }


    /** 支付成功 */
    private static purchaseSuccess(product: ProductInfo, showReward: boolean) {
        mLogger.debug("purchaseSuccess");
        this.settleProduct(product, showReward);
    }

    /** 结算商品，内部需要处理所有IAPID的购买逻辑 */
    private static settleProduct(product: ProductInfo, showReward: boolean) {
        // app.tipMsg.showToast(`支付成功 ${productId} ${showReward}`);
        /**这一条商店数据，可以拿到奖励啥的，好发放 */
        let _shopData = GameTool.getOneShopDataByIapIdOrShopId(product.id || product.productId);
        let _shopName = _shopData.Des;
        /**静态表的价格，这个主要是为了打点和存档用的，真正的充值用的不是这个 */
        let _price = _shopData.Price;
        /**类型，比较重要的分发参数 */
        let _type = _shopData.StoreTypes;
        /**奖励 */
        let _rewardItems = _shopData.ItemId;

        /**如果是购买礼包/活动，需要在这里存下档，给我的是商品ID哈，不是开启方案ID */
        let _buyShopGiftBag = (shopId: number) => {
            //已购买常驻礼包
            if (!GameData.Inst.shopHaveBuy[shopId]) {
                GameData.Inst.shopHaveBuy[shopId] = 0;
            }
            //已购买限时礼包
            if (!GameData.Inst.giftBagStage.haveBuyData[shopId]) {
                GameData.Inst.giftBagStage.haveBuyData[shopId] = 0;
            }
            //今日购买
            if (!GameData.Inst.shopHaveBuyToday[shopId]) {
                GameData.Inst.shopHaveBuyToday[shopId] = 0;
            }
            //本周购买
            if (!GameData.Inst.shopHaveBuyWeek[shopId]) {
                GameData.Inst.shopHaveBuyWeek[shopId] = 0;
            }
            //各种累计
            GameData.Inst.shopHaveBuy[shopId]++;
            GameData.Inst.giftBagStage.haveBuyData[shopId]++;
            GameData.Inst.shopHaveBuyToday[shopId]++;
            GameData.Inst.shopHaveBuyWeek[shopId]++;

            //累计已充值金额（静态表配置）
            GameData.Inst.haveRechargeMoney += _price;
            //累计充值次数
            GameData.Inst.haveRechargeTime++;
            GameData.Inst.delaySave();

            //发事件
            app.event.emit(EventKey.ChongQianLa, product.id || product.productId);

            //买了礼包需要发送协会信息，无脑发，如果没配置的话会不管
            let _planId = giftBagCtrl.Inst.getActIdByShopId(_shopData.Id);
            GuildModel.Inst.httpSendGongXiTalkInfo(_planId || _shopData.Id);

        }

        //金猪
        if (_type == 301) {
            //发放奖励，弹出奖励界面,金猪只会获得钻石奖励
            let _reward: string = "2, " + GameData.Inst.haveGetDiamondNumInPig;
            PlayerData.Inst.getReward(_reward);
            if (showReward) GameTool.showMoneyReward(_reward, { autoGet: false });
            //处理存档
            _buyShopGiftBag(_shopData.Id);
            //关闭金猪活动，注意，活动的ID和商品ID不是一致的哈
            let _planId = giftBagCtrl.Inst.getActIdByShopId(_shopData.Id);
            giftBagCtrl.Inst.closeGiftCheck(_planId);
        }

        // 限时弹窗礼包（受活动模块管理）
        // 常规礼包购买
        // 充值钻石
        // 金币不足界面的3个金币礼包
        // 二选一礼包，NEW新手礼包（受活动模块管理）
        // 时装卷购买，大和小都算在内
        if (_type == 3 || _type == 2 || _type == 1001 || _type == 501 || _type == 5 || _type == 1003) {
            //发放奖励，弹出奖励界面
            PlayerData.Inst.getReward(_rewardItems);
            if (showReward) GameTool.showMoneyReward(_rewardItems, { autoGet: false });
            //处理存档
            _buyShopGiftBag(_shopData.Id);
            //关闭限时礼包，限时礼包的PLAN ID和 SHOP ID是一致的，但是类型5的SHOP ID是N合一的充值，活动ID不一致，需要特殊处理下
            if (_type == 3 || _type == 5) {
                let _planId: number;
                if (_type == 5) {
                    _planId = giftBagCtrl.Inst.getActIdByShopId(_shopData.Id);
                } else {
                    _planId = _shopData.Id
                }
                giftBagCtrl.Inst.closeGiftCheck(_planId);
            }
        }

        //纯时装礼包，需要处理下，把已拥有的时装，按照配置的半价转换成时装卷
        if (_type == 1004) {
            //判断奖励里面的时装有咩有已经拥有的，如果有，会自动转换成时装卷（半价）
            let _newRewardString = dressTools.checkAndTransDressItemReward(_rewardItems);
            //发放奖励，弹出奖励界面
            PlayerData.Inst.getReward(_newRewardString);
            if (showReward) GameTool.showMoneyReward(_newRewardString, { autoGet: false, name: "服装礼包", isShowChangeItemIcon: true });
            //处理存档
            _buyShopGiftBag(_shopData.Id);
            //上传魅力值排行榜数据
            myHomeTools.httpSetMyMeiLiScore();
            //获得时装，发给NEW TAG，标记获得了新的时装
            let _newRewardArr = GameTool.cutStringMapToArr(_newRewardString);
            for (const v of _newRewardArr) {
                let _dressId = +v[0];
                dressTools.addNewDressIdToBox(_dressId);
            }

            //通过商品id找到活动id
            let _planId = giftBagCtrl.Inst.getActIdByShopId(_shopData.Id);
            if (_planId == 99191 || _planId == 99192) {
                //n选一礼包，不需要这里关闭
            } else {
                //关闭活动
                giftBagCtrl.Inst.closeGiftCheck(_shopData.Id);
            }
        }

        //1+N礼包需要特殊处理
        if (_type == 801) {
            //发放奖励，注意，免费赠送的也会在这里直接发放
            PlayerData.Inst.getReward(_rewardItems);

            let _allRewardString = _shopData.FreeGetReward.split("|").join(";");
            let _finalString = GameTool.mergeRewardsString(_allRewardString);
            PlayerData.Inst.getReward(_finalString);

            //显示的奖励界面是正经充值获得的
            if (showReward) GameTool.showMoneyReward(_rewardItems, { autoGet: false });
            //处理存档
            _buyShopGiftBag(_shopData.Id);
            //通知关闭活动，PLAN ID和 SHOP ID是一致的
            giftBagCtrl.Inst.closeGiftCheck(_shopData.Id);
        }

        //战斗里，买了复活礼包
        if (_type == 502) {
            //发放奖励，弹出奖励界面,注意，不飞金币，并且关掉奖励界面需要发送复活的事件
            PlayerData.Inst.getReward(_rewardItems);
            if (showReward) GameTool.showMoneyReward(_rewardItems, {
                autoGet: false,
                isFly: false,
                onClose: () => {
                    app.event.emit(EventKey.haveBuyFuHuoGiftBag, _shopData.Id);
                }
            });
            //处理存档
            _buyShopGiftBag(_shopData.Id);
        }

        //神秘礼包
        if (_type == 201) {
            //发放奖励，弹出奖励界面
            PlayerData.Inst.getReward(_rewardItems);
            if (showReward) GameTool.showMoneyReward(_rewardItems, { autoGet: false });
            //处理存档
            _buyShopGiftBag(_shopData.Id);
        }

        //普通通行证（包含MINI通行证）
        if (_type == 101) {
            //发放奖励，弹出奖励界面
            PlayerData.Inst.getReward(_rewardItems);
            if (showReward) {
                if (GameTemp.Inst.isFighting) {
                    //要区分是否战斗内，战斗内购买MINIPASS会免费送复活的
                    GameTool.showMoneyReward(_rewardItems, {
                        autoGet: false,
                        isFly: false,
                        onClose: () => {
                            app.event.emit(EventKey.haveBuyFuHuoGiftBag, _shopData.Id);
                        }
                    });
                } else {
                    //不在战斗中，也有特殊处理，如果购买的是MINIPASS，会自动弹出头像界面，触发引导让玩家带上新获得的头像框
                    if (_shopData.Id == 3013) {
                        GameTool.showMoneyReward(_rewardItems, {
                            autoGet: false, onClose: () => {
                                app.ui.show(UIConstant.UIPlayerHead);
                            }
                        });
                    } else {
                        GameTool.showMoneyReward(_rewardItems, { autoGet: false });
                    }
                }
            }
            //通行证购买后有一些特殊的处理，比如存档啥的
            GameData.Inst.battlePassStage.isBuy = true;
            GameData.Inst.delaySave();
            //处理存档
            _buyShopGiftBag(_shopData.Id);
            app.event.emit(EventKey.battlePassDataChaned);
            app.event.emit(EventKey.battlePassDataBuy, true);
        }

        //糖果副本通行证，第一档
        if (_type == 102) {
            GameData.Inst.battlePassFuBenStage.isBuyYin = true;
            GameData.Inst.delaySave();
            //处理存档
            _buyShopGiftBag(_shopData.Id);
            app.event.emit(EventKey.battlePassDataChaned);
            app.event.emit(EventKey.battlePassDataBuy, true);
            app.tipMsg.showToast(_shopData.Des + "购买成功");
        }

        //糖果副本通行证，第二档
        if (_type == 103) {
            GameData.Inst.battlePassFuBenStage.isBuyGold = true;
            GameData.Inst.delaySave();
            //处理存档
            _buyShopGiftBag(_shopData.Id);
            app.event.emit(EventKey.battlePassDataChaned);
            app.event.emit(EventKey.battlePassDataBuy, true);
            app.tipMsg.showToast(_shopData.Des + "购买成功");
        }

        //塔罗牌的门票礼包
        if (_type == 401) {
            //发放奖励，弹出奖励界面
            PlayerData.Inst.getReward(_rewardItems);
            if (showReward) GameTool.showMoneyReward(_rewardItems, { autoGet: false });
            //存档塔罗牌礼包的购买次数，注意这个次数在活动结束时会被清空
            if (GameData.Inst.taroSatge.haveBuyTicketData[_shopData.Id]) {
                GameData.Inst.taroSatge.haveBuyTicketData[_shopData.Id]++;
            } else {
                GameData.Inst.taroSatge.haveBuyTicketData[_shopData.Id] = 1;
            }
            GameData.Inst.delaySave();
            //处理存档
            _buyShopGiftBag(_shopData.Id);
        }

        //惊喜传送带
        if (_type == 901) {
            //发放奖励，弹出奖励界面
            PlayerData.Inst.getReward(_rewardItems);
            GameData.Inst.haveGetLineRewardNum++;
            GameData.Inst.delaySave();
            if (showReward) GameTool.showMoneyReward(_rewardItems, {
                autoGet: false, onClose: () => {
                    //领取了奖励再出发移动效果哈
                    app.event.emit(EventKey.lineRewardHaveGet);
                }
            });
            //处理存档
            _buyShopGiftBag(_shopData.Id);
        }

        //无限体力礼包
        if (_type == 4) {
            //发放奖励，弹出奖励界面
            PlayerData.Inst.getReward(_rewardItems);
            GameData.Inst.haveBuyHealth = true;
            if (showReward) GameTool.showMoneyReward(_rewardItems, { autoGet: false });
            GameData.Inst.delaySave();
            //处理存档
            _buyShopGiftBag(_shopData.Id);
        }

        //成长基金
        if (_type == 2001) {
            app.tipMsg.showToast("成长基金购买成功");
            let _planId = giftBagCtrl.Inst.getActIdByShopId(_shopData.Id);
            GameData.Inst.growthFundData.haveBuyActIdArr.push(_planId);
            GameData.Inst.delaySave();
            //处理存档
            _buyShopGiftBag(_shopData.Id);
        }

        //（废弃）去广告，2个ID写死的哈，2个ID会一起处理
        if (_type == 2000) {
            if (_rewardItems != "") {
                PlayerData.Inst.getReward(_rewardItems);
                if (showReward) GameTool.showMoneyReward(_rewardItems, { autoGet: false });
            }
            //记得修改去广告的专用存档
            GameData.Inst.vipStage.isNoChaAd = true;
            GameData.Inst.delaySave();
            //处理存档，去广告得特殊处理下
            _buyShopGiftBag(5000);
            _buyShopGiftBag(5001);
            //关闭限时礼包，去广告得特殊处理下
            giftBagCtrl.Inst.closeGiftCheck(5000);
            giftBagCtrl.Inst.closeGiftCheck(5001);
            //去广告的飘个字才行
            app.tipMsg.showToast("已为您永久去除插屏广告");
        }

        //各种打点

        //充值成功
        app.chan.reportEvent(mReportEvent.iap_success, { k: _shopName });
        //数数打点，注意，传的商品名
        app.chan.reportEvent(mReportEvent.iap_success, { Shop_Name: _shopName, IAP_Sales: _shopData.Price }, "SS");
        //充值次数
        app.chan.reportEvent(mReportEvent.iap_times);
        //累计充值额度，静态表额度
        app.chan.reportSumEvent(mReportEvent.iap_allSales, _price);
        //今日充值人数
        app.chan.reportEventDaily(mReportEvent.iap_user_daily);
        //今日新增付费人数
        if (GameData.Inst.isNewUser) app.chan.reportEventDaily(mReportEvent.iap_newUser_daily);

        //玩家首次购买的商品ID
        app.chan.reportEventLifetime(mReportEvent.iap_firstPay_IAPID, { k: _shopName });
        //玩家首次充值发生在第几分钟
        app.chan.reportEventLifetime(mReportEvent.iap_firstPay_TimeM, { k: GameData.Inst.myAllOnlineTimeM });

        //数数打点，注意，传的商品名
        app.chan.reportEventLifetime(mReportEvent.iap_firstPay, {
            IAP_Time: GameData.Inst.myAllOnlineTimeM,
            Shop_Name: _shopName,
            IAP_Sales: _shopData.Price
        }, "SS");

        //数数打点——用户数据（变化时发送）
        let time = Utils.formatTime("YYYY-MM-DD hh:mm:ss");
        //首次充值时间
        EasDataCollect.Inst.userSetOnce({ first_pay_time: time });
        //最新一次充值时间
        EasDataCollect.Inst.userSet({ last_pay_time: time });
        //累计充值金额，静态数值
        EasDataCollect.Inst.userSet({ nowIapPrice: GameData.Inst.haveRechargeMoney });
        //累计付费次数
        // ThinkingDataCollect.Inst.userSet({ nowIapTimes: GameData.Inst.haveRechargeTime });

    }



    private static restoreSuccess(goodsIds: string[]) {
        mLogger.debug("restoreSuccess");
    }
}


