import { Enum } from "cc";

export const ELanguage = Enum({
    Auto: 0,
    SimplifiedChinese: 1,
    TraditionalChinese: 2,
    English: 3,
})

export enum ELanguageCode {
    ChineseSimplified = "sc",
    ChineseTraditional = "tc",
    English = "en"
}