import { App } from "../../mlib/App";
import { EIAPResult, SDKCallback } from "../../mlib/sdk/MSDKWrapper";
import { UITipMsg } from "../ui/base/UITipMsg";
import { ProductData } from "./GameConfig";

/** 统一处理内购 */
export class ShopUtil {

    private static isInit;

    /** 请在合适的时机调用，可能会有延迟到账的商品 */
    public static initPurchase() {
        if (this.isInit) return;
        this.isInit = true;
        SDKCallback.inAppPurchase = { success: this.purchaseSuccess, fail: this.purchaseFail };
        App.chan.queryIAP();
    }

    private static purchaseSuccess(id: string) {
        console.log("purchaseSuccess");
        var productData = ProductData.fromId(id);
        if (productData) {
            this.settleProduct(productData, true);
        }
    }

    /** 结算商品 */
    private static settleProduct(productData: ProductData, showReward: boolean) {

    }

    private static purchaseFail(reason: number) {
        console.log("purchaseFail");
        switch (reason) {
            case EIAPResult.Cancel:
                UITipMsg.Inst.showToast("取消支付!");
                break;
            case EIAPResult.VerifyFail:
                UITipMsg.Inst.showToast("驗證訂單失敗，可能會有延遲!");
                break;
            default:
                UITipMsg.Inst.showToast("支付失敗!");
                break;
        }
    }

    private static queryIAPSuccess(goodsIds: string[]) {
        console.log("queryIAPSuccess");

        for (let goodsId of goodsIds) {
            var productData = ProductData.fromGoodsId(goodsId);
            if (productData) {
                this.settleProduct(productData, false);
            }
        }
    }

    private static restoreSuccess(goodsIds: string[]) {
        console.log("restoreSuccess");
    }
}


