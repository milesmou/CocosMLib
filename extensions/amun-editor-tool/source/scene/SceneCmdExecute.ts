import { ReplaceComponent } from "./replacecomponent/ReplaceComponent";

export class SceneCmdExecute {
    /** 替换系统组件为扩展后的自定义组件 */
    public static replaceComponent() {
        ReplaceComponent.replace();
    }

}