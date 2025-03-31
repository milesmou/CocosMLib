import path from "path";
import { AssetInfo } from "../../@cocos/creator-types/editor/packages/asset-db/@types/public";
import { Logger } from "../tools/Logger";
import { Utils } from "../tools/Utils";

export class MenuExecute {
    public static copyLoadLocation(assetInfo: AssetInfo) {
        let filePath = Utils.toUniSeparator(assetInfo.file);
        let bundlePath = Utils.getBundlePath(filePath);
        let location = "";
        if (bundlePath) {
            location = filePath.replace(bundlePath + "/", "");
            location = location.replace(path.extname(location), "");
        }
        Editor.Clipboard.write("text", location);
        Logger.info("加载路径", location);
    }
}