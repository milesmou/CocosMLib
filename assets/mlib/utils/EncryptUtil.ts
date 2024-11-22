import CryptoJS from "crypto-es";
/** 加密解密工具类 依赖三方库(crypto-es) */
export class EncryptUtil {
    private static secretKey = "0a980xjfap80szrz";//密钥必须是16位，且避免使用保留字符

    /** AES加密字符串并返回16进制字符串 */
    public static AesEncryptHex(str: string, secretKey?: string) {
        let key = CryptoJS.enc.Utf8.parse(secretKey || this.secretKey);
        let encryptedData = CryptoJS.AES.encrypt(str, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return encryptedData.ciphertext.toString();
    }

    /** AES解密16进制字符串 */
    public static AesDecryptHex(str: string, secretKey?: string) {
        let key = CryptoJS.enc.Utf8.parse(secretKey || this.secretKey);
        let encryptedHexStr = CryptoJS.enc.Hex.parse(str);
        let encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        let decryptedData = CryptoJS.AES.decrypt(encryptedBase64Str, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return decryptedData.toString(CryptoJS.enc.Utf8);
    }

}