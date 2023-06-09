export class HttpRequest {

    public static async request(url: string, args: { method?: "GET" | "POST", data?: any, requestHeader?: { [key: string]: string }, showWait?: boolean } = {}) {
        let { method, data, requestHeader, showWait } = args;
        method = method || "GET";
        let p = new Promise<XMLHttpRequest>((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            xhr.timeout = 5000;
            xhr.ontimeout = () => {
                reject("timeout");
            };
            xhr.onabort = () => {
                reject("user abort");
            };
            xhr.onerror = () => {
                reject("network error");
            };
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                    resolve(xhr);
                }
            }
            xhr.open(method, url, true);
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            if (requestHeader) {
                for (const key in requestHeader) {
                    xhr.setRequestHeader(key, requestHeader[key]);
                }
            }
            xhr.send(data);

        });
        return p;
    }
}

