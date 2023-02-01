
export interface Language   {
    Language: { [id: number]: Language };
}

export interface GameConfig   {
    Config: { [id: number]: Config };
}

export interface GameData   {
    Guide: { [id: number]: Guide };
}

export interface Language  {
    ID: number;
    zh: string;
    zh_ft: string;
}

export interface Config  {
    ID: number;
    FreeGiftReward: string[];
    FreeGiftCD: number;
    FreeGiftLimitNum: number;
    VideoPlan: number;
    PicPlan: number;
    OpenHotter: number;
    AuditMode: number;
}

export interface GlobalVal  {
    ID: number;
    PhotoAlbumCostDiam: number;
    FirstAlbumID: number;
    HPInitiNum: number;
    DiaInitiNum: number;
    HPMax: number;
    HPRecovery: number[];
    RandomVoiceGroup: number[];
    UIBGM: number[];
    InitWallpaper: number;
    LocalVideo: number[];
    LoginVideoLimit: number[];
    MemoryVideoFree: number;
}

export interface Guide  {
    ID: number;
    GuideID: number;
    UIName: string;
    NodePath: string;
    ShowBtnNode: boolean;
    FingerDir: number;
    TipText: string;
    TipPos: number[];
    ClickScreen: boolean;
}