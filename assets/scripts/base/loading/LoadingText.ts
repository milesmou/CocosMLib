export interface ILanguage {
    sc: string;
    tc: string;
    en: string;
}

/** 加载界面的多语言 */
export const LoadingText = {
    Config: <ILanguage>{ sc: "加载配置中", tc: "加載配置中", en: "Loading Config" },
    ConfigFail: <ILanguage>{ sc: "加载配置失败,请检查网络", tc: "加載配置失敗,請檢查網絡", en: "Loading configuration failed, please check the network" },
    CheckUpdate: <ILanguage>{ sc: "检查更新中", tc: "加載配置中", en: "Loading Config" },
    DownloadUpdate: <ILanguage>{ sc: "下载更新中", tc: "加載配置中", en: "Loading Config" },
    UpdateFinished: <ILanguage>{ sc: "更新完成", tc: "加載配置中", en: "Loading Config" },
    Login: <ILanguage>{ sc: "登录中", tc: "登錄中", en: "Login" },
    SyncGameData: <ILanguage>{ sc: "数据同步中", tc: "數據同步中", en: "Sync PlayerData" },
    LoadGameRes: <ILanguage>{ sc: "加载游戏资源", tc: "加載遊戲資源", en: "Loading GameData" },
    LoadScene: <ILanguage>{ sc: "加载场景", tc: "加載場景", en: "Loading Scene" },
} as const;