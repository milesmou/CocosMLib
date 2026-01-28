import { _decorator } from "cc";
import { ENativeBridgeKey, NativeBridge } from "db://assets/mlib/sdk/SDKWrapper/NativeBridge";
import { RewardedVideoParams, SDKTemp } from "db://assets/mlib/sdk/SDKWrapper/SDKCallback";
import { SDKListener } from "db://assets/mlib/sdk/SDKWrapper/SDKListener";
import { Channel } from "../../../../mlib/sdk/Channel";

const { ccclass } = _decorator;


@ccclass("Dev")
export class Dev extends Channel {


    public vibrate(type?: "light" | "medium" | "heavy"): void {
        if (!app.vibrateEnable.value) return;
        type = type || "light";
        NativeBridge.sendToNative(ENativeBridgeKey.Vibrate, type);
    }

    public showRewardedAd(args: RewardedVideoParams): void {
        SDKTemp.rewardedVideoParams = args;
        if (!super.rewardedAdCheck()) return;
        SDKListener.onRewardedVideo({ code: 3 });
        SDKListener.onRewardedVideo({ code: 4 });
        SDKListener.onRewardedVideo({ code: 0 });
    }
}