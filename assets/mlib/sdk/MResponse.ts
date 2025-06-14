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

/** 内购未完成订单信息 */
export interface RspUnusedOrderInfo {
    /** 游戏自定义订单id */
    gameOrderId: string;
    /** 商品id */
    productId: string;
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
    /** 扩展参数 */
    extParam: string;
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

/** 头像检测请求数据 */
export interface ReqWxMediaSecCheck {
    /** 为避免其它地方获取的accessToken失效,可以选择复用 */
    accessToken?: string;
    /**  用户的openid（用户需在近两小时访问过小程序） */
    openid: string;
    /** 场景枚举值:1 资料;2 评论;3 论坛;4 社交日志;5 聊天 */
    scene: number;
    /** 需检测的图片 url，支持图片格式包括 jpg, jepg, png 等 */
    media_url: string;
    /** 媒体类型: 固定填 2 图片 */
    media_type: number;
}

/** 微信安全检测响应数据 */
export interface RspWxSecCheck {
    /** 错误码 0:成功 */ //其它参考https://developers.weixin.qq.com/minigame/dev/api-backend/open-api/sec-check/security.msgSecCheck.html#method-http
    errcode: number;
    /** 错误信息 */
    errmsg: string;
    /** 综合结果 */
    result: {
        /** 有risky(拦截)、pass(通过)、review(可疑)三种值 */
        suggest: "risky" | "pass" | "review",
        /** 命中标签枚举值:100正常;10001营销广告;20001时政;20002色情;20003辱骂;20006违法犯罪;20012低俗;21000其他 */
        label: number
    }
}

/** 微信登录响应数据 */
export interface RsqWxLogin {
    /** 用户唯一标识 */
    openid: string;
    /** 会话密钥 过期时间不固定 */
    session_key: string;
    /** 用户在开放平台的唯一标识符，若当前小程序已绑定到微信开放平台账号下会返回，详见 UnionID 机制说明 */
    unionid: number;
}

/** 微信敏感数据解密请求数据 */
export interface ReqWXBizData {
    /**  
     * 会话密钥 必须是未过期才行，可用wx.checkSession接口校验
     * 
     * 非必传，和code二选一
     */
    session_key?: string;
    /**
     * 通过 wx.login 接口获得临时登录凭证，调用次接口可能会使之前的session_key失效
     * 
     * 非必传，和session_key二选一
     */
    code?: string;
    /** 使用 sha1( rawData + sessionkey ) 得到字符串，用于校验用户信息 */
    signature: string;
    /** 包括 GameClubData 在内的加密数据，详见加密数据解密算法 */
    encryptedData: string;
    /** 加密算法的初始向量 */
    iv: string;
}

/** 微信敏感数据解密响应数据 */
export interface RspWXBizData {
    /** 会话密钥 过期时间不固定 */
    session_key: string;
    /** 解密后的原数据 */
    rawData: number;
}


/** 玩家存档数据格式 */
export interface RspPlayerGameData {
    data: string;
    updateTimeMS: number;
}

/** 抖音添加场景检查值 */
export interface ReqDYSceneCheck {
    /** 玩家id */
    openId: string;
    /** 生效时间戳(秒) */
    effectiveTimeS: number;
}