import { MLogger } from "../logger/MLogger";


export class HttpRequest {

    public static async request(url: string, args: { method?: "GET" | "POST", data?: any, timeout?: number } = {}) {
        let xhr = await this.requestXHR(url, args);
        if (xhr) return xhr.responseText;
        return null;
    }

    public static async requestObject(url: string, args: { method?: "GET" | "POST", data?: any, timeout?: number } = {}) {
        let xhr = await this.requestXHR(url, args);
        if (xhr) {
            try {
                return JSON.parse(xhr.responseText) as object;
            } catch (error) {
                MLogger.error(error);
            }
        }
        return null;
    }

    public static async requestXHR(url: string, args: { method?: "GET" | "POST", data?: any, timeout?: number } = {}) {
        let { method, data, timeout } = args;
        if (data) {
            if (typeof data === "object") data = JSON.stringify(data);
            else data = data.toString();
        }
        method = method || "GET";
        timeout = timeout || 5000;
        let p = new Promise<XMLHttpRequest>((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            xhr.timeout = timeout;
            xhr.ontimeout = () => {
                MLogger.error(url + " timeout");
                resolve(null);
            };
            xhr.onabort = () => {
                MLogger.error(url + " user abort");
                resolve(null);
            };
            xhr.onerror = () => {
                MLogger.error(url + " network error");
                resolve(null);
            };
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if(xhr.status >= 200 && xhr.status < 400){
                        resolve(xhr);
                    }else{
                        resolve(null);
                    }
                }
            }
            xhr.open(method, url, true);
            if (data) {
                xhr.setRequestHeader("Content-Type", "application/json");
            }
            xhr.send(data);
        });
        return p;
    }

    /**
     * 重复请求地址
     * @param url 请求地址
     * @param predicate 判断是否中断请求 true请求成功中断请求 false请求失败继续请求
     * @param repeat 重复请求次数
     * @param interval 请求间隔时间 单位:秒
     * @returns 
     */
    public static async requestRepeat(url: string, predicate: (string) => boolean, repeat: number, interval: number, args: { method?: "GET" | "POST", data?: any } = {}): Promise<string> {
        repeat -= 1;
        let now = Date.now();
        let nextReqTimeMS = now + interval * 1000;
        let result = await this.request(url, args);
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

