import { CryptoUtil } from "../../utils/CryptoUtil";

export class GameWebTool {

    /** 用于签名校验的请求头 */
    public static get gameCodeHeader(): Record<string, string> {
        return this.getSignHeader(mGameSetting.gameCode);
    }

    /** 用于签名校验的请求头 */
    public static get gameNameHeader(): Record<string, string> {
        return this.getSignHeader(mGameSetting.gameName);
    }

    /** 用于签名校验的请求头 */
    public static get tokenHeader(): Record<string, string> {
        let ts = mTime.now().toString();
        return { ts: ts, token: "xxsxx" };
    }

    /** 获取用于签名校验的请求头 */
    public static getSignHeader(code: string): Record<string, string> {
        let ts = mTime.now().toString();
        let sign = CryptoUtil.MD5(code + ts + "224");
        return { ts: ts, sign: sign, uid: app.user.userId };
    }
}