import { Component, director } from "cc";

interface RequestArgs {
    method: "GET" | "POST";
    header?: Record<string, string>;
    contentType?: "application/json" | "application/x-www-form-urlencoded";
    data?: any;
    timeout?: number;
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
                        if (typeof data === "object") data = this.jsonToUrlEncode(data);
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
     * 请求地址直到成功或超时
     * @param url 请求地址
     * @param predicate 判断是否中断请求 true请求成功中断请求 false请求失败继续请求
     * @param duration 请求最多持续时间 单位:秒 (失败后0.5秒后会再次请求)
     */
    public static async requestUntil(url: string, predicate: (res: string) => boolean, duration: number, args: RequestArgs): Promise<string> {
        let endTimeMS = Date.now() + duration * 1000;
        while (true) {
            let result = await this.requestText(url, args);
            if (predicate(result)) {//请求成功
                return result;
            } else if (Date.now() > endTimeMS) {//请求超时
                return null;
            } else {//失败继续
                await this.delay(0.5);
            }
        }
    }

    /** 将Json对象转化为Url编码格式 例:将{a:1,b:2}转化为a=1&b=2 */
    public static jsonToUrlEncode(jsonObj: { [key: string]: any }, sortKeys = true) {
        let arr: string[] = [];
        let keys = Object.keys(jsonObj).sort();
        if (sortKeys) keys.sort();
        for (const key of keys) {
            arr.push(key + "=" + jsonObj[key]);
        }
        return arr.join("&");
    }

    private static delay(dur: number) {
        let comp = director.getScene().getComponentInChildren(Component);
        let p = new Promise((resolve) => {
            comp.scheduleOnce(resolve, dur)
        });
        return p;
    }
}

