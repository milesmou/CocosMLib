export interface ILanguage {
    /** 简体中文 */
    readonly sc: string;
    /** 繁体中文 */
    readonly tc: string;
    /** 英文 */
    readonly en: string;
}

/** 
 *  创建一个加载界面的多语言对象
 * @param sc 简体中文
 * @param tc 繁体中文
 * @param en 英文
 */
function textObject(sc: string, tc: string, en: string): ILanguage {
    return { sc: sc, tc: tc, en: en }
}

/** 加载界面的多语言配置,值为textObject创建的对象 */
export const LoadingText = {
    Config: textObject("加载配置中", "加載配置中", "Loading Config"),
    ConfigFail: textObject("加载配置失败,请检查网络", "加載配置失敗,請檢查網絡", "Loading configuration failed, please check the network"),
    CheckUpdate: textObject("检查更新中", "加載配置中", "Loading Config"),
    DownloadUpdate: textObject("下载更新中", "加載配置中", "Loading Config"),
    UpdateFinished: textObject("更新完成", "加載配置中", "Loading Config"),
    Login: textObject("登录中", "登錄中", "Login"),
    LoginFail: textObject("登录失败,请检查网络", "登錄失敗,請檢查網絡", "Login failed, please check the network"),
    SyncGameData: textObject("数据同步中", "數據同步中", "Sync PlayerData"),
    LoadGameRes: textObject("加载游戏资源", "加載遊戲資源", "Loading GameData"),
    LoadScene: textObject("加载场景", "加載場景", "Loading Scene"),
    LoadMap: textObject("加载地图", "加載地圖", "Loading Map"),
} as const;