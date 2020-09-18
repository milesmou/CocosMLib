/** 全局配置对象 */
declare var Config: IConfig;
/** 平台兼容抽象对象 */
declare var Platform: IPlatform;
/** 屏幕旋转类型 1(竖屏) 2(横屏) */
declare var Orientation: 1 | 2;
/** 屏幕类型 1(<=16:9非全面屏) 2(>16:9全面屏) */
declare var ScreenType: 1 | 2;

interface IConfig {
    env: number;
}

interface IPlatform {
    adCfg: { [type: string]: { [id: number]: string } };
    login(obj?);
    getPlatform(): string;
}