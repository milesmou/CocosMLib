import { Enum } from "cc";

/** 打包渠道枚举 */
export const EChannel = Enum({
    Dev: 0,
    TestNoSDK: 1,
    TestWithSDK: 2,
    Trial: 3,
});