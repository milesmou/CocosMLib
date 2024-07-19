"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
class Config {
    static get data() {
        if (!fs_extra_1.default.existsSync(this.FilePath)) {
            fs_extra_1.default.writeJSONSync(this.FilePath, {});
        }
        return fs_extra_1.default.readJSONSync(this.FilePath);
    }
    static get(key, defaultV) {
        let d = this.data;
        let arr = key.split(".");
        let v = d;
        for (let i = 0; i < arr.length; i++) {
            const k = arr[i];
            v = v[k];
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
    static set(key, value) {
        let d = this.data;
        if (d) {
            let arr = key.split(".");
            let v = d;
            for (let i = 0; i < arr.length; i++) {
                const k = arr[i];
                if (i == arr.length - 1) {
                    v[k] = value;
                }
                else {
                    if (v[k] == undefined)
                        v[k] = {};
                    v = v[k];
                    if (typeof v != "object") {
                        console.error(`${k}的值不是一个对象`);
                        return;
                    }
                }
            }
            fs_extra_1.default.writeJSONSync(this.FilePath, d, { spaces: 4 });
        }
    }
}
exports.Config = Config;
Config.FilePath = path_1.default.join(Editor.Project.path, "/settings/amun-editor-config.json");
