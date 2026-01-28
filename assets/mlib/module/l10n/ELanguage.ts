import { Enum } from "cc";

export const ELanguage = Enum({
    Auto: 0,
    ChineseSimplified: 1,
    ChineseTraditional: 2,
    English: 3,
})

export enum ELanguageCode {
    ChineseSimplified = "zh_sc",
    ChineseTraditional = "zh_tc",
    English = "en"
}