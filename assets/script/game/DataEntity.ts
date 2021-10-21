export interface Language   {
    Language: { [id: number]: Language };
}

export interface GameConfig   {
    Config: { [id: number]: Config };
}

export interface GameGuide   {
    Guide: { [id: string]: Guide };
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




export class Guide  {
    /** 主键 */
    ID: number;
    /** 引导ID */
    GuideID: number;
    /** 节点所在UI名字 */
    UIName: string;
    /** 节点在UI中的路径 */
    NodePath: string;
    /** 是否点击屏幕即完成本步引导 */
    ClickScreen: boolean;
    /** 遮罩透明度 */
    ShadeOpacity: number;
    /** 挖孔类型 */
    HollowType: number[];
    /** 挖孔处响应区域大小 */
    ReactArea: number[];
    /** 手指方向 */
    FingerDir: number;
    /** 手指相对挖孔偏移 */
    FingerOffset: number[];
    /** 提示文字 */
    TipText: string;
    /** 提示文字位置 */
    TipPos: number[];
}

