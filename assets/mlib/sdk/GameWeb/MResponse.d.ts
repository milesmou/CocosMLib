
/** HTTP请求响应的数据格式 */
declare interface MResponse<T = any> {
    code: number;
    data: T;
    msg: string;
}

