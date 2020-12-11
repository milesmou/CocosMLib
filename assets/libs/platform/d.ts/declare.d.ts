/** 自定义全局变量 */
declare var mm: {
    /** 配置对象 */
    config: IConfig,
    /** 设备安全区域尺寸 */
    safeArea:cc.Size;
    /** 系统语言 */
    lang: string;
    /** 平台兼容抽象对象，根据对运行环境的检测，创建对应平台类的实例 */
    platform: IPlatform;
}

interface IConfig {
    /** 平台名字，区分当前上架到哪个平台*/
    platformName: string;
    version: string;
    url: string;
}

interface IPlatform {
    adUintId: { [type: string]: { [id: number]: string } };
    login(obj?);
}