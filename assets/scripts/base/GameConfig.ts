/** 游戏一些配置 可以是远程或本地 */
class GameConfig {
    //基本配置
    /** 关服 此包不在生效 */
    public static gf = false;
    /** 热更 */
    public static rg = true;
    /** 审核 */
    public static sh = false;
    /** GM工具 */
    public static gm = false;
    /** 其它配置 */
    public static bcfgs: Record<string, boolean> = {};

    /** 远程bundle名字:版本 */
    public static bundleVers: Record<string, string> = {};

    public static deserialize(content: string) {
        let iniData = this.getTxtData(content);

        if (iniData.has("base")) {
            let lines = iniData.get("base");
            for (const line of lines) {
                if (line.startsWith("GF=")) this.gf = this.convertBool(line.replace("GF=", ""));
                else if (line.startsWith("RG=")) this.rg = this.convertBool(line.replace("RG=", ""));
                else if (line.startsWith("SH=")) this.sh = this.convertBool(line.replace("SH=", ""));
                else if (line.startsWith("GM=")) this.gm = this.convertBool(line.replace("GM=", ""));
                else {
                    let arr = line.split("=");
                    if (arr.length == 2) {
                        this.bcfgs[arr[0]] = this.convertBool(arr[1]);
                    } else {
                        console.warn("错误的配置:" + line);
                    }
                }
            }
        }

        if (iniData.has("bundle")) {
            let lines = iniData.get("bundle");
            for (const line of lines) {
                let arr = line.split("=");
                if (arr.length == 2) {
                    this.bundleVers[arr[0]] = arr[1];
                } else {
                    console.warn("错误的配置:" + line);
                }
            }
        }
    }


    private static getTagIndexMap(tags: string[]): Map<string, number> {
        let tagMap = new Map<string, number>();
        for (let i = 0; i < tags.length; i++) {
            tagMap.set(tags[i], i);
        }

        return tagMap;
    }

    private static convertString(value: string) {
        return value.trim();
    }

    private static convertBool(value: string) {
        value = value.trim();
        return value == "1" || value.toUpperCase() == "TRUE";
    }

    private static convertNumber(value: string) {
        value = value.trim();
        let result = parseFloat(value)
        if (isNaN(result)) {
            result = 0;
        }
        return result;
    }

    private static getTxtData(content: string): Map<string, string[]> {
        let map = new Map<string, string[]>();
        let lastTag: string = null;
        let lines = content.split("\n");
        for (const line of lines) {
            let text = line.trim();
            if (!text) continue;
            if (text.startsWith("//")) continue;
            if (text.startsWith("[")) {
                let tag = text.replace("[", "").replace("]", "").trim();
                map.set(tag, []);
                lastTag = tag;
            }
            else if (lastTag) {
                map.get(lastTag).push(text);
            }
        }
        return map;
    }
}

//@ts-ignore
globalThis.mGameConfig = GameConfig;
export { };
declare global {
    /** 游戏一些配置 可以是远程或本地 */
    const mGameConfig: typeof GameConfig;
}