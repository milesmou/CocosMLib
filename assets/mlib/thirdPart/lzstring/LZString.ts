export class LZString {
    // static compress(input: string): string {
    //     return globalThis['LZString'].compress(input);
    // }
    // static decompress(input: string): string {
    //     return globalThis['LZString'].decompress(input);
    // }

    static compressToUTF16(input: string): string {
        return globalThis['LZString'].compressToUTF16(input);
    }

    static decompressFromUTF16(input: string): string {
        return globalThis['LZString'].decompressFromUTF16(input);
    }
}