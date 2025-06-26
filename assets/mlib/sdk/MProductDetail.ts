export class MProductDetail {

    public static productDetailMap: Map<string, MProductDetail>;

    /** 商品ID */
    public productId: string;

    /** 名字 */
    public name: string;

    /** 描述 */
    public desc: string;

    /** 是否订阅商品 */
    public isSub: boolean;

    /** 价格(包含货币符号) */
    public formattedPrice: string;

    /** 根据商品id获取商品 */
    public static fromProductId(productId: string) {
        if (!this.productDetailMap) return null;
        return this.productDetailMap.get(productId);
    }

    /** 获取商品的价格(包含货币符号) */
    public static getFormattedPrice(productId: string) {
        let product = this.fromProductId(productId);
        if (!product) return "???";
        return product.formattedPrice;
    }
}