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
export interface RspEmail {
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
export interface RspAnnouncement {
    /** 唯一id */
    id: string;
    /**是否启用 */
    enable: boolean,
    /**是否进游戏自动弹出公告 */
    autoShow: boolean;
    /**标题 */
    subject: string;
    /**正文 */
    body: string;
    /**奖励 */
    attachment: string;
    /** 创建时间 */
    createTime?: number;
}

/** 排行榜数据 */
export interface Leaderboard {
    /** 用户id */
    uid: string;
    /** 用户名 */
    uname?: string;
    /** 分数 */
    score: number;
}

/** 玩家存档数据格式 */
export interface RspPlayerGameData {
    data: string;
    updateTimeMS: number;
}