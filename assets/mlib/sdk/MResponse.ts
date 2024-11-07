/** HTTP请求响应的数据格式 */
export interface MResponse<T = any> {
    code: number;
    data: T;
    msg: string;
}

/** 游戏数据存档格式 */
export interface RspGameData {
    uid: string;
    key: string;
    data: string;
    updateTime: number;
}

/** GM数据存档格式 */
export interface RspGmData {
    id: string;
    data: string;
    commit: string;
    createTime: number;
}

/** 邮件数据 */
export interface RspEmailData {
    /** 唯一id */
    id: string;
    /** 发送者 */
    sender: string;
    /** 主题 */
    subject: string;
    /** 内容 */
    body: string;
    /** 附带奖励 */
    attachment: string;
    /** 发件时间 */
    createTime: number;
    /** 到期时间 */
    expireTime: number;
}

/** 公告数据 */
export interface RspAnnouncementData {
    /** 唯一id */
    id: string;
    /** 自动展示 */
    autoShow: boolean;
    /** 主题 */
    subject: string;
    /** 内容 */
    body: string;
    /** 附带奖励 */
    attachment: string;
    /** 发件时间 */
    createTime: number;
}

/** 玩家存档数据格式 */
export interface RspPlayerGameData {
    data: string;
    updateTimeMS: number;
}