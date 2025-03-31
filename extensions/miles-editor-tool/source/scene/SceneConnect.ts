import fs from "fs-extra";
import { Constant } from "../tools/Constant";

/** 通过文件和Scene扩展通信 */
export class SceneConnect {
    public static send(method: string, ...args: any[]) {
        let obj: any;
        try {
            obj = fs.readJSONSync(Constant.SceneConnectFilePath);
        } catch (e) {
            obj = {};
        }
        obj[method] = args;
        fs.writeJSONSync(Constant.SceneConnectFilePath, obj);
    }
}