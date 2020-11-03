/** 自定义全局变量 */
declare var mm: {
    /** 全局配置对象 */
    config: IConfig,
    /** 平台兼容抽象对象 */
    platform: IPlatform;
    /** 系统语言 */
    lang: string;
    /** 屏幕旋转类型 1(竖屏) 2(横屏) */
    orientation: 1 | 2;
    /** 屏幕类型 1(<=16:9非全面屏) 2(>16:9全面屏) */
    screen: 1 | 2;
}

interface IConfig {
    env: number;
}

interface IPlatform {
    adCfg: { [type: string]: { [id: number]: string } };
    login(obj?);
    getPlatform(): string;
}