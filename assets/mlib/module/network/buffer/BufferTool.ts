export class BufferTool {



    /** 将一个数字转化为Uint8Array */
    public static encodeNumber(num: number) {
        return new Uint8Array(new Uint32Array([num]).buffer);
    }

     /** 将一个字符串转化为Uint8Array */
     public static encodeString(str: number) {
        // return new Uint8Array(new Uint32Array([num]));
    }


    /** 连接两Uint8Array */
    public static concat(u8Array1: Uint8Array, u8Array2: Uint8Array) {
        let newArray = new Uint8Array(u8Array1.length + u8Array2.length);
        for (let i = 0; i < u8Array1.length; i++) {
            newArray[i] = u8Array1[i];
        }
        for (let i = u8Array1.length; i < u8Array2.length; i++) {
            newArray[i] = u8Array2[i];
        }
        return newArray;
    }
}