import { _decorator, Animation } from "cc";
import { MButton } from "../extend/MButton";
import { EUIFormAnim } from "./EUIFormAnim";
import { EUIFormPassiveType } from "./EUIFormPassiveType";
import { UIComponent } from "./UIComponent";

const { property, ccclass, requireComponent } = _decorator;

@ccclass("UIForm")
export abstract class UIForm extends UIComponent {
    @property({
        displayName: "销毁",
        tooltip: "UI关闭时销毁"
    })
    destroyNode = false;
    @property({
        displayName: "遮罩",
        tooltip: "是否在UI下层显示半透明遮罩"
    })
    showShade = false;
    @property({
        displayName: "全屏",
        tooltip: "有时需要根据是弹窗还是全屏UI来判断是否显示或隐藏下层UI"
    })
    fullScreen = false;
    @property({
        displayName: "自动隐藏",
        tooltip: "被全屏UI覆盖时,是否隐藏界面,降低DC"
    })
    autoHide = false;

    @property({
        displayName: "阻塞输入事件",
        tooltip: "是否阻塞所有的输入事件向下层传递"
    })
    blockInputEvent = true;

    @property({
        type: EUIFormAnim,
        displayName: "动画",
        tooltip: "是否启用UI打开和关闭动画"
    })
    action = EUIFormAnim.NONE;
    @property({
        type: MButton,
        displayName: "关闭按钮",
        tooltip: "自动为按钮绑定UI关闭事件"
    })
    closeBtn: MButton = null;
    /** UI完整加载路径 */
    public abstract get uiName(): string;
    /** UI名字 */
    public abstract get shortName(): string;
    protected animation: Animation;

    public abstract get isAnimEnd(): boolean;

    protected visible: boolean;
    protected args: any = null;

    /** 初始化UI，只会执行一次，在子类重写该方法时，必须调用super.init() */
    public abstract init(uiName: string): void;

    /** 设置本次打开传递的参数 */
    public abstract setArgs(args: any): void;

    /** 设置界面的显示隐藏 */
    public abstract setVisible(visible: boolean);

    /** 播放界面打开动画 */
    public abstract playShowAnim(): Promise<void>;

    /** 播放界面关闭动画 */
    public abstract playHideAnim(): Promise<void>;

    /** 关闭界面 */
    protected abstract safeClose();

    /** UI准备打开时触发 (UI打开动画播放前) */
    public onShowBegin() { }

    /** UI准备关闭时触发 (UI关闭动画播放前) */
    public onHideBegin() { }

    /** UI完全打开时触发 (UI打开动画播放完) */
    public onShow() { }

    /** UI完全关闭时触发 (UI关闭动画播放完) */
    public onHide() { }

    /** 因为其它UI，被动的显示和隐藏 */
    public onPassive(passiveType: EUIFormPassiveType, ui: UIForm) { }
}