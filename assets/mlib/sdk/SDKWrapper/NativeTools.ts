import { JSB } from "cc/env";
import { ENativeBridgeKey, NativeBridge } from "./NativeBridge";
import { SDKCallback } from "./SDKCallback";

/** 原生平台常用的一些方法 */
export class NativeTools {

    /** 震动 */
    public static vibrate(type?: "light" | "medium" | "heavy") {
        if (!app.vibrateEnable.value) return;
        type = type || "light";
        NativeBridge.sendToNative(ENativeBridgeKey.Vibrate, type);
    }

    /** 显示toast */
    public static showToast(text: string) {
        NativeBridge.sendToNative("showToast", text);
    }


    /** 设置系统剪贴板的内容 */
    public static setClipboardData(data: string, result: ResultCallback): void {
        if (!JSB) return;
        SDKCallback.callback.set("setClipboardData", res => {
            result?.({ code: res ? 0 : 1 });
        });
        NativeBridge.sendToNative("setClipboardData", data)
    }

    /** 获取系统剪贴板的内容 */
    public static getClipboardData(result: ResultCallback): void {
        if (!JSB) return;
        SDKCallback.callback.set("getClipboardData", res => {
            result?.({ code: 0, data: res });
        });
        NativeBridge.sendToNative("getClipboardData");
    }

    /** 基础事件 */
    public static nativeBaseEvent(event: string, args?: (string | number) | (string | number)[], tag?: string) {
        let arr: (string | number)[];
        if (Array.isArray(args)) {
            arr = [event, ...args];
        } else if (args) {
            arr = [event, args];
        } else {
            arr = [event];
        }
        NativeBridge.sendToNative(ENativeBridgeKey.NativeBaseEvent, arr);
    }
}