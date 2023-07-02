import { GameData } from "./GameData";
import { EGuideType } from "./GameEnum";

/**
* 引导管理类
*/
export class GameGuide {
    private static CheckOnceGuideVaild(guidetype: EGuideType, addFlag = true) {
        let key = "FinishGuide_" + guidetype;
        if (GameData.Inst.flag.has(key)) return false;
        if (addFlag) //会立即开始引导 添加完成标记
        {
            GameData.Inst.flag[key] = "1";
            GameData.Inst.delaySave();
        }
        return true;
    }

}