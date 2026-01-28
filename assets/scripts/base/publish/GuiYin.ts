import { GuiYinBase } from "db://assets/mlib/sdk/GuiYinBase";

class GuiYin extends GuiYinBase {
    public install(data: { adNetwork?: string; attributionPlatform?: string; customProperties?: Record<string, any>; }) {

    }

    public register(data?: { regType?: string; regStatus?: string; customProperties?: Record<string, any>; }) {

    }

    public login(data?: { uid?: string; roleName?: string; customProperties?: Record<string, any>; }) {

    }

    public createRole(data?: { uid?: string; roleName?: string; customProperties?: Record<string, any>; }) {
    }

    public rewardedAdShow(data?: { adId?: string; customProperties?: Record<string, any>; }) {

    }

    public rewardedAdClick(data?: { adId?: string; customProperties?: Record<string, any>; }) {

    }

    public purchaseOrder(data: { orderId: string; payAmount: number; currencyType?: string; payType?: string; status?: string; customProperties?: Record<string, any>; }) {

    }

    public purchase(data: { orderId: string; payAmount: number; currencyType?: string; payType?: string; customProperties?: Record<string, any>; }) {
        
    }

    public addToWishlist(data?: { addToWishlistType?: string; customProperties?: Record<string, any>; }) {

    }

    public share(data?: { shareTarget?: string; customProperties?: Record<string, any>; }) {

    }

    public tutorialFinish(data?: { tutorialType?: string; customProperties?: Record<string, any>; }) {

    }

    public updateLevel(data: { beforeUpgrade: number; afterUpgrade: number; customProperties?: Record<string, any>; }) {

    }

    public viewContent(data: { content?: number; customProperties?: Record<string, any>; }) {

    }

}

GuiYinBase.setInstance(new GuiYin())
