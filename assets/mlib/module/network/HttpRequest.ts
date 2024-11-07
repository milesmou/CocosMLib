
interface RequestArgs {
    method: "GET" | "POST";
    header?: Record<string, string>;
    contentType?: "application/json" | "application/x-www-form-urlencoded";
    data?: any;
    timeout?: number;
}

/** 将Json对象转化为Url编码格式 */
export function JsonToUrlEncode(jsonObj: { [key: string]: any }) {
    let arr: string[] = []
    for (const key in jsonObj) {
        arr.push(key + "=" + jsonObj[key]);
    }
    return arr.join("&");
}


export class HttpRequest {

    public static async request(url: string, args: RequestArgs) {
        let { method, header, contentType, data, timeout } = args;
        method = method || "GET";
        timeout = timeout || 5000;
        let p = new Promise<XMLHttpRequest>((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            xhr.timeout = timeout;
            xhr.ontimeout = () => {
                mLogger.error(url, "timeout");
                resolve(null);
            };
            xhr.onabort = () => {
                mLogger.error(url, "user abort");
                resolve(null);
            };
            xhr.onerror = () => {
                mLogger.error(url, "network error");
                resolve(null);
            };
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        resolve(xhr);
                    } else {
                        resolve(null);
                    }
                }
            }
            xhr.open(method, url, true);
            if (header) {
                for (const key in header) {
                    xhr.setRequestHeader(key, header[key]);
                }
            }
            if (data) {//有携带数据 设置Content-Type
                contentType = contentType || "application/json";
                if (data instanceof ArrayBuffer) {
                    xhr.responseType = "arraybuffer";
                } else {
                    if (contentType == "application/json") {
                        if (typeof data === "object") data = JSON.stringify(data);
                        else data = data.toString();
                    } else if (contentType == "application/x-www-form-urlencoded") {
                        if (typeof data === "object") data = JsonToUrlEncode(data);
                        else data = data.toString();
                    }
                    xhr.setRequestHeader("Content-Type", contentType);
                }
            }
            xhr.send(data);
        });
        return p;
    }


    public static async requestText(url: string, args: RequestArgs) {
        let xhr = await this.request(url, args);
        if (xhr) return xhr.responseText;
        return null;
    }

    public static async requestObject(url: string, args: RequestArgs) {
        let text = await this.requestText(url, args);
        try {
            return JSON.parse(text);
        } catch (error) {
            mLogger.error(error);
        }
        return null;
    }

    public static async requestBuffer(url: string, args: RequestArgs) {
        let xhr = await this.request(url, args);
        if (xhr?.response && xhr.response instanceof ArrayBuffer) {
            return xhr.response;;
        }
        return null;
    }


    /**
     * 重复请求地址
     * @param url 请求地址
     * @param predicate 判断是否中断请求 true请求成功中断请求 false请求失败继续请求
     * @param repeat 重复请求次数
     * @param interval 请求间隔时间 单位:秒
     * @returns 
     */
    public static async requestRepeat(url: string, predicate: (string) => boolean, repeat: number, interval: number, args: RequestArgs): Promise<string> {
        repeat -= 1;
        let now = Date.now();
        let nextReqTimeMS = now + interval * 1000;
        let result = await this.requestText(url, args);
        let now1 = Date.now();
        if (predicate(result)) {
            return result;
        }
        else if (repeat > 0) {
            if (now1 >= nextReqTimeMS) {
                return await this.requestRepeat(url, predicate, repeat, interval, args);
            }
            else {
                // await TimeMgr.Inst.delay((nextReqTimeMS - now1) / 1000);
                return await this.requestRepeat(url, predicate, repeat, interval, args);
            }
        } else {
            return result;
        }
    }
}

