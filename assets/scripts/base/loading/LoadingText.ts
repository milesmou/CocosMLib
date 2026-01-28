export interface ILanguage {
    /** 简体中文 */
    readonly zh_sc: string;
    /** 繁体中文 */
    readonly zh_tc: string;
    /** 英文 */
    readonly en: string;
}

/** 
 *  创建一个加载界面的多语言对象
 * @param zh_sc 简体中文
 * @param zh_tc 繁体中文
 * @param en 英文
 */
function textObject(zh_sc: string, zh_tc: string, en: string): ILanguage {
    return { zh_sc: zh_sc, zh_tc: zh_tc, en: en }
}

/** 加载界面的多语言配置,值为textObject创建的对象 */
export const LoadingText = {
    Config: textObject("加载配置中", "加載配置中", "Loading Config"),
    ConfigFail: textObject("加载配置失败,请检查网络", "加載配置失敗,請檢查網絡", "Loading configuration failed, please check the network"),
    CheckUpdate: textObject("检查更新中", "加載配置中", "Loading Config"),
    DownloadUpdate: textObject("下载更新中", "加載配置中", "Loading Config"),
    UpdateFinished: textObject("更新完成", "加載配置中", "Loading Config"),
    UpdateFailTip: textObject("更新失败,请检查网络", "更新失敗,請檢查網絡", "update failed, please check the network"),
    Login: textObject("登录中", "登錄中", "Login"),
    LoginFail: textObject("登录失败,请检查网络", "登錄失敗,請檢查網絡", "login failed, please check the network"),
    SyncGameData: textObject("数据同步中", "資料同步中", "Sync PlayerData"),
    SyncGameDataFail: textObject("数据同步失败,请检查网络", "資料同步失敗,請檢查網絡", "sync playerData failed, please check the network"),
    LoadGameRes: textObject("加载游戏资源", "加載遊戲資源", "Loading GameData"),
    LoadScene: textObject("加载场景", "加載場景", "Loading Scene"),
    LoadMap: textObject("加载地图", "加載地圖", "Loading Map"),
} as const;