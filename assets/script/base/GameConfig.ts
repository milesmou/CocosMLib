/** 商品类 */
export class ProductData {
    /** 主键ID */
    public id: string;

    /** 商品ID */
    public goodsId: string;

    /** 商品类型 */
    public type: number;

    /** 货币符号 */
    public unit: string;

    /** 价格 */
    public price: number;

    /** 次数限制 */
    public limit: number;

    /** 名字 */
    public name: string;

    /** 描述 */
    public desc: string;

    /** 图标 */
    public icon: string;

    /** 奖励 */
    public reward: string;

    public static fromId(id: string) {
        return GameConfig.product.find(v => v.id == id);
    }

    public static fromGoodsId(goodsId: string) {
        return GameConfig.product.find(v => v.goodsId == goodsId);
    }
}

/** 游戏一些配置参数 可以是远程或本地 */
export class GameConfig {
    //基本配置
    /** 关服 此包不在生效 */
    public static gf = false;
    /** 热更 */
    public static rg = true;
    /** 审核 */
    public static sh = false;
    /** GM工具 */
    public static gm = false;

    //商品(广告或内购)
    public static product: ProductData[] = [];


    public static deserialize(content: string) {
        let iniData = this.getIniData(content);

        if (iniData.has("base")) {
            let lines = iniData.get("base");
            for (const line of lines) {
                if (line.startsWith("GF=")) this.gf = this.convertBool(line.replace("GF=", ""));
                else if (line.startsWith("RG=")) this.rg = this.convertBool(line.replace("RG=", ""));
                else if (line.startsWith("SH=")) this.sh = this.convertBool(line.replace("SH=", ""));
                else if (line.startsWith("GM=")) this.gm = this.convertBool(line.replace("GM=", ""));
            }
        }

        if (iniData.has("goods")) {
            let lines = iniData.get("goods");
            if (lines.length > 1) {
                let tagDict = this.getTagIndexMap(lines[0].split('|'));
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    let columns = line.split('|');
                    let productData = new ProductData();
                    productData.id = this.convertString(columns[this.getIndex(tagDict, "id")]);
                    productData.goodsId = this.convertString(columns[this.getIndex(tagDict, "goodsId")]);
                    productData.type = this.convertNumber(columns[this.getIndex(tagDict, "type")]);
                    productData.unit = this.convertString(columns[this.getIndex(tagDict, "unit")]);
                    productData.price = this.convertNumber(columns[this.getIndex(tagDict, "price")]);
                    productData.limit = this.convertNumber(columns[this.getIndex(tagDict, "limit")]);
                    productData.name = this.convertString(columns[this.getIndex(tagDict, "name")]);
                    productData.desc = this.convertString(columns[this.getIndex(tagDict, "desc")]);
                    productData.icon = this.convertString(columns[this.getIndex(tagDict, "icon")]);
                    productData.reward = this.convertString(columns[this.getIndex(tagDict, "reward")]);
                    this.product.push(productData);
                }
            }
        }
    }


    public static getTagIndexMap(tags: string[]): Map<string, number> {
        let tagMap = new Map<string, number>();

        for (let i = 0; i < tags.length; i++) {
            tagMap.set(tags[i], i);
        }

        return tagMap;
    }

    public static getIndex(tagMap: Map<string, number>, tag: string) {
        if (tagMap.has(tag))
            return tagMap[tag];
        else console.error(`GetIndex  ${tag} 不存在`);
        return 0;
    }

    public static convertString(value: string) {
        return value.trim();
    }

    public static convertBool(value: string) {
        value = value.trim();
        return value == "1" || value.toUpperCase() == "TRUE";
    }

    public static convertNumber(value: string) {
        value = value.trim();
        let result = parseFloat(value)
        if (isNaN(result)) {
            result = 0;
        }
        return result;
    }

    public static getIniData(content: string): Map<string, string[]> {
        let map = new Map<string, string[]>();
        let lastTag: string = null;
        let lines = content.split("\n");
        for (const line of lines) {
            let text = line.trim();
            if (!text) continue;
            if (text.startsWith("//")) continue;
            if (text.startsWith("[")) {
                let tag = text.replace("[", "").replace("]", "").trim();
                map[tag] = [];
                lastTag = tag;
            }
            else if (lastTag) {
                map[lastTag].Add(text);
            }
        }
        return map;
    }
}