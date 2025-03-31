export interface LoadingArgs {
    /** 提示的内容 */
    content?: string;
    /** 是否显示透明蒙层 默认false */
    mask?: boolean;
    /** 显示时长(秒),不填或小于0时需要手动隐藏 */
    duration?: number;
}