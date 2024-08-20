/** 常量定义  */
const Contanst = {
    /** 自定义的资源包 */
    bundles: ["dynamic", "localization"],
    /** 按钮默认音效地址 */
    buttonAuidoLocation: "audio/Click_1",
}

///@ts-ignore
globalThis.mContanst = Contanst;
export { };
declare global {
    /** 常量定义 */
    const mContanst: typeof Contanst;
}