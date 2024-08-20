import { EIAPResult, SDKCallback } from "../../../mlib/sdk/MSDKWrapper";
import { ProductDetail } from "./ProductDetail";
// import UIWait from "../ui/UIWait";



/** 统一处理内购 */
export class ShopUtil {

    private static isInit;

    public static init() {
        SDKCallback.initInAppPurchase = this.initPurchase.bind(this);
    }

    /** 请在合适的时机调用，可能会有延迟到账的商品 */
    private static initPurchase() {
        if (this.isInit) return;
        this.isInit = true;
        SDKCallback.onStartInAppPurchase = this.onStartInAppPurchase.bind(this);
        SDKCallback.inAppPurchase = this.onPurchaseUpdate.bind(this);
        this.reqProductDetail();
        app.chan.restoreIAP();
    }

    /** 获取商品详情 */
    private static reqProductDetail() {
        if (ProductDetail.productDetailMap) return;
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
        app.timer.scheduleOnce(this.reqProductDetail.bind(this), 5);
    }

    private static onStartInAppPurchase(productId: string) {
        // UIWait.Inst.show();
        app.chan.reportEvent(mReportEvent.IapStart, { k: productId });
    }

    private static onPurchaseUpdate(code: EIAPResult, arg: string) {
        if (code != EIAPResult.DelaySuccess && code != EIAPResult.ProductDetail) {
            // UIWait.Inst.hide();
        }
        switch (code) {
            case EIAPResult.NoEnv:
                // app.ui.showToast("IAP0001", true);
                app.chan.reportEvent(mReportEvent.IapFail, { k: arg });
                break;
            case EIAPResult.NoProduct:
                // app.ui.showToast("IAP0002", true);
                app.chan.reportEvent(mReportEvent.IapFail, { k: arg });
                break;
            case EIAPResult.Success:
                this.purchaseSuccess(arg, true);
                break;
            case EIAPResult.DelaySuccess:
                this.purchaseSuccess(arg, false);
                break;
            case EIAPResult.Fail:
                // app.ui.showToast("IAP0004", true);//支付失败
                app.chan.reportEvent(mReportEvent.IapFail, { k: arg });
                break;
            case EIAPResult.VerifyFail:
                // app.ui.showToast("IAP0003", true);//验证失败，支付结果可能会有延迟
                break;
            case EIAPResult.ProductDetail:
                this.onGetProductDetail(arg);
                break;
            default:
                break;
        }
    }

    /** 从后台获取商品详情 default:使用数据表的商品详情*/
    private static onGetProductDetail(content: string) {
        mLogger.debug("onGetProductDetail");
        try {
            if (content == "default") {
                ProductDetail.productDetailMap = new Map();
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
                let arr: ProductDetail[] = JSON.parse(content);
                ProductDetail.productDetailMap = new Map();
                for (const v of arr) {
                    ProductDetail.productDetailMap.set(v.productId, v);
                }
            }

        } catch (error) {
            mLogger.error(error);
        }
    }

    /** 支付成功 */
    private static purchaseSuccess(productId: string, showReward: boolean) {
        mLogger.debug("purchaseSuccess");
        this.settleProduct(productId, showReward);
    }

    /** 结算商品，内部需要处理所有IAPID的购买逻辑 */
    private static settleProduct(productId: string, showReward: boolean) {
        // app.ui.showToast(`支付成功 ${productId} ${showReward}`);


    }



    private static restoreSuccess(goodsIds: string[]) {
        mLogger.debug("restoreSuccess");
    }
}


