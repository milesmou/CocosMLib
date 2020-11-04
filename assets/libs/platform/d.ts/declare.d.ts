/** 自定义全局变量 */
declare var mm: {
    /** 配置对象 */
    config: IConfig,
    /** 系统语言 */
    lang: string;
    /** 屏幕旋转类型 1(竖屏) 2(横屏) */
    orientation: 1 | 2;
    /** 屏幕类型 1(<=16:9非全面屏) 2(>16:9全面屏) */
    screen: 1 | 2;
    /** 平台兼容抽象对象，根据对运行环境的检测，创建对应平台类的实例 */
    platform: IPlatform;
}

interface IConfig {
    env: number;
}

interface IPlatform {
    adUintId: { [type: string]: { [id: number]: string } };
    login(obj?);
    getPlatform(): string;
}