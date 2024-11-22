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

/** 敏感词检测请求数据 */
export interface ReqWxMsgSecCheck {
    /** 为避免其它地方获取的accessToken失效,可以选择复用 */
    accessToken?: string;
    /**  用户的openid（用户需在近两小时访问过小程序） */
    openid: string;
    /** 场景枚举值（1 资料；2 评论；3 论坛；4 社交日志） */
    scene: number;
    /** 需检测的文本内容，文本字数的上限为2500字，需使用UTF-8编码 */
    content: string;
}

/** 敏感词检测响应数据 */
export interface RspWxMsgSecCheck {
    /** 错误码 0:成功 */ //其它参考https://developers.weixin.qq.com/minigame/dev/api-backend/open-api/sec-check/security.msgSecCheck.html#method-http
    errcode: number;
    /** 错误信息 */
    errmsg: string;
    /** 综合结果 */
    result: {
        /** 有risky(拦截)、pass(通过)、review(可疑)三种值 */
        suggest: string,
        /** 命中标签枚举值:100正常;10001营销广告;20001时政;20002色情;20003辱骂;20006违法犯罪;20012低俗;21000其他 */
        label: number
    }
}

/** 玩家存档数据格式 */
export interface RspPlayerGameData {
    data: string;
    updateTimeMS: number;
}