import { IBuildTaskOption, IBuildResult } from "../../@types";
import { Config } from "../tools/Config";
import { Constant } from "../tools/Constant";

/** 拷贝自定义构建模板资源 */
export class BuildTemplate {
    static copy(options: IBuildTaskOption, result: IBuildResult) {
        if (!Config.get(Constant.BuildTemplateSaveKey, false)) return;//未启用构建模板
    }
}