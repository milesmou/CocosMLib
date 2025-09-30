import { UIConstant } from "../../gen/UIConstant";

/** 配置打开UI时 预加载的界面 */
export const UIPreloadCfg: { [key: string]: string[] } = {
    [UIConstant.UIHUD]: [UIConstant.UIGuanKaInfo, UIConstant.UISetting],
    [UIConstant.UIFightScene]: [UIConstant.UIGameSucShow, UIConstant.UIGameSuccess, UIConstant.UIGamePause],
}