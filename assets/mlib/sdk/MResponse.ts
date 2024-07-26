/** HTTP请求响应的数据格式 */
export interface MResponse {
    code: number;
    data: any;
    msg: string;
}

/** 游戏数据存档格式 */
export interface ResponseGameData {
    uid: string;
    key: string;
    data: string;
    commit: string;
    updateTime: number;
}

/** GM数据存档格式 */
export interface ResponseGmData {
    id: string;
    data: string;
    commit: string;
    createTime: number;
}