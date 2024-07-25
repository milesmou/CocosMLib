import path from "path";
import fs from "fs-extra";
/** 保存和读取本地配置 */
export class Config {
    private static FilePath = path.join(Editor.Project.path, "/settings/amun-editor-config.json");

    public static get data() {
        if (!fs.existsSync(this.FilePath)) {
            fs.writeJSONSync(this.FilePath, {});
        }
        return fs.readJSONSync(this.FilePath) as any;
    }
    public static get<T>(key: string, defaultV: T) {
        let d = this.data;
        let arr = key.split(".");
        let v = d;
        for (let i = 0; i < arr.length; i++) {
            const k = arr[i];
            v = v[k] as T;
            if (i < arr.length - 1) {
                if (v === undefined) {
                    v = defaultV;
                    this.set(key, defaultV);
                    break;
                }
                if (typeof v !== "object") {
                    v = defaultV;
                    console.error(`${k}的值不是一个对象`);
                    break;
                }
            }
        }
        return v;
    }

    public static set(key: string, value: any) {
        let d = this.data;
        if (d) {
            let arr = key.split(".");
            let v = d;
            for (let i = 0; i < arr.length; i++) {
                const k = arr[i];
                if (i == arr.length - 1) {
                    v[k] = value;
                } else {
                    if (v[k] == undefined) v[k] = {};
                    v = v[k];
                    if (typeof v != "object") {
                        console.error(`${k}的值不是一个对象`);
                        return;
                    }
                }
            }
            fs.writeJSONSync(this.FilePath, d, { spaces: 4 });
        }
    }
}