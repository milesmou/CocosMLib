/** HTTP请求响应的数据格式 */
export interface MResponse<T = any> {
    code: number;
    data: T;
    msg: string;
}

/** 游戏数据存档格式 */
export interface ResponseGameData {
    uid: string;
    key: string;
    data: string;
    updateTime: number;
}

/** GM数据存档格式 */
export interface ResponseGmData {
    id: string;
    data: string;
    commit: string;
    createTime: number;
}


/** 邮件数据存档格式 */
export interface ResponseEmailData {
    id: string;
    content: string;
    reward: string;
    uid: string;
    createTime: number;
    expireTime: number;
}
