export class ProductDetail {

    public static productDetailMap: Map<string, ProductDetail>;

    /** 商品ID */
    public productId: string;

    /** 名字 */
    public name: string;

    /** 描述 */
    public desc: string;

    /** 是否订阅商品 */
    public isSub: boolean;

    /** 价格描述(包含货币符号和金额) */
    public formattedPrice: string;

    /** 货币代码(ISO) */
    public currencyCode: string;

    public static fromProductId(productId: string) {
        if (!this.productDetailMap) return null;
        return this.productDetailMap.get(productId);
    }

    public static getFormattedPrice(productId: string) {
        let product = this.fromProductId(productId);
        if (!product) return "???";
        return product.formattedPrice;
    }
}