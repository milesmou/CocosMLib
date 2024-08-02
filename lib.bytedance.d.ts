/** 抖音小游戏API声明 */
declare namespace tt {
    export function getSystemInfoSync();
    export function getLaunchOptionsSync();
    export function getUpdateManager();
    export function showModal(options?: any);
    export function vibrateShort(options?: any);
    export function vibrateLong(options?: any);
    /** 显示当前小游戏页面的转发按钮。转发按钮位于小游戏页面右上角的“更多”中。*/
    export function showShareMenu(options?: { success?: (errMsg: string) => void, fail?: (errMsg: string) => void, complete?: () => void });
    /** 调用该API可以跳转到某个小游戏入口场景，目前仅支持跳转「侧边栏」场景 */
    export function navigateToScene(options: {
        /** 需要确认的入口场景（目前仅支持的入参为'sidebar'） */
        scene: "sidebar",
        /** 接口调用成功的回调函数 */
        success?: (errMsg: string) => void,
        /** 接口调用结束的回调函数（调用成功、失败都会执行） */
        complete?: () => void,
        /** 接口调用失败的回调函数 */
        fail?: (errMsg: string, errNo: number) => void,
    });
    /** 全局唯一的录屏管理器。通过tt.getGameRecorderManager获取 */
    interface GameRecorderManager {
        /** 开始录屏。可以通过 onStart 接口监听录屏开始事件。 */
        start(options?: {
            /** 录屏的时长，单位 s，必须大于 3s，最大值 300s（5 分钟）。默认10 */
            duration?: number,
            /** 是否添加水印，会在录制出来的视频上添加默认水印，目前不支持自定义水印图案。默认true */
            isMarkOpen?: boolean,
            /** 水印距离屏幕上边界的位置，单位为 dp。默认0 */
            locTop?: number,
            /** 水印距离屏幕左边界的位置，单位为 dp。 默认0 */
            locLeft?: number,
            /** 设置录屏帧率，对于性能较差的手机可以调低参数以降低录屏性能消耗。默认30 */
            frameRate?: number,
        }): void;
        /** 监听录屏开始事件。 */
        onStart(callback: (res: any) => void): void;
        /** 停止录屏。可以通过 GameRecorderManager.onStop 接口监听录屏结束事件，获得录屏地址。 */
        stop(): void;
        /** 监听录屏结束事件，可以获得录屏地址。 */
        onStop(callback: (res: { videoPath: string, duration: number }) => void): void;
        /** 监听录屏错误事件。 */
        onError(callback: (onError?: string) => void): void;
        /** 记录精彩的视频片段，调用时必须是正在录屏，以调用时的录屏时刻为基准，指定前 x 秒，后 y 秒为将要裁剪的片段，可以多次调用，记录不同时刻。在结束录屏时，可以调用 clipVideo 接口剪辑并合成记录的片段。 */
        recordClip(options?: {
            /** 数组的值表示记录这一时刻的前后时间段内的视频，单位是 s 默认[3, 3]*/
            timeRange: number[],
            /** 接口调用成功的回调函数 index:裁剪片段的唯一索引，用于 tt.clipVideo 接口调用时指定裁剪拼接顺序。*/
            success: (index: number) => void,
            /** 接口调用失败的回调函数 */
            fail: () => void,
            /** 接口调用结束的回调函数（调用成功、失败都会执行） */
            complete: () => void,
        }): void;
    }
    /** 获取全局唯一的录屏管理器 ，该功能只能录制到小游戏全局唯一的上屏 canvas 上的内容，即开发者逻辑所绘制的内容。其他的包括客服按钮，任何类型的广告，以及 showToast 等 API 展示的 native 内容，都无法被录制到。 */
    export function getGameRecorderManager(): GameRecorderManager;

    export function createRewardedVideoAd(options: any);
    export function shareAppMessage(options: any);
    export function login(options: any);
    export function onShow(callback: (params: any) => void);
    export function offShow(callback?: (params: any) => void);
}