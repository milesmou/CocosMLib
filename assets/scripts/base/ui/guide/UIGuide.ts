import { Button, Component, Label, Node, Prefab, Size, Tween, UIOpacity, UITransform, Vec3, _decorator, instantiate, misc, tween, v3 } from 'cc';
import { App } from '../../../../mlib/App';
import { AssetMgr } from '../../../../mlib/module/asset/AssetMgr';
import { ELoggerLevel, MLogger } from '../../../../mlib/module/logger/MLogger';
import { UIBase } from '../../../../mlib/module/ui/manager/UIBase';
import { CCUtils } from '../../../../mlib/utils/CCUtil';
import { EventKey } from '../../../base/GameEnum';
import GameTable from '../../../base/GameTable';
import { UIConstant } from '../../../gen/UIConstant';
import { TGuide, Vector2 } from '../../../gen/table/Types';
import { EMaskHollowType, GuideMask } from './GuideMask';
import { GuidePrefab } from './GuidePrefab';
const { ccclass, property } = _decorator;


@ccclass
export class UIGuide extends Component {

    public static Inst: UIGuide;

    private _logger = new MLogger("Guide", ELoggerLevel.Warn);

    @property(GuideMask)
    private m_Mask: GuideMask = null;
    @property(Node)
    private m_Ring: Node = null;
    @property(Node)
    private m_Finger: Node = null;
    @property(Node)
    private m_Tip: Node = null;
    @property(Node)
    private m_HollowTarget: Node = null;
    @property(Node)
    private m_BtnScreen: Node = null;
    @property(Node)
    private m_PrefabParent: Node = null;

    private _hollowTargetTf: UITransform;

    public get isGuide() { return this._guideId > 0; }
    public get nowGuide() { return this._guideId; }
    public get stepIndex() {
        if (this._guideData?.length > 0) {
            if (this._dataIndex > -1 && this._dataIndex < this._guideData.length) {
                return this._guideData[this._dataIndex].StepIndex;
            }
        }
        return -1;
    }


    private _guideId: number = 0;
    private _guideData: TGuide[] = [];
    private _dataIndex: number;// 数据索引 从_guideData中取值使用
    private _onStep?: (stepIndex: number) => void;
    private _onStepNode?: (stepIndex: number, ui: UIBase) => Promise<Node>;
    private _onManualStep?: (stepIndex: number) => void;
    private _onEnded: () => void;

    private _skipGuide = false;//关闭所有引导


    onLoad() {
        UIGuide.Inst = this;
        this._hollowTargetTf = this.m_HollowTarget.getComponent(UITransform);
        this.hide(true);
        this.m_Mask.onEventTargetInvalid.addListener(() => {
            this._logger.warn(`事件节点已销毁 跳过本步引导`);
            this.checkOver();
        })
    }


    private hide(fast = false) {
        this.setShadeOpacity(0, fast ? 0 : 0.15, () => {
            this.m_Mask.node.active = false;
        });
        this.m_Ring.active = false;
        this.m_Finger.active = false;
        this.m_Tip.active = false;
        this.m_BtnScreen.active = false;
        this.destroyPrefab();
    }

    private guideOver() {
        App.event.emit(EventKey.OnGuideEnd, this._guideId);
        this._guideId = 0;
        this.hide();
        this._onEnded && this._onEnded();
        this._onEnded = null;
    }

    private checkOver() {
        this._logger.debug("---------结束引导步骤", this._guideId, this.stepIndex);
        this._logger.debug();
        let data = this._guideData[this._dataIndex];
        App.chan.reportEvent("guide_step", { k: data.ID });
        if (this._dataIndex == this._guideData.length - 1) {
            this._logger.debug("结束引导" + this._guideId);
            this.guideOver();
        }
        else {
            this.m_Mask.reset();
            this._dataIndex++;
            this.showGuideStep();
        }
    }

    /** 
     * 开始引导
     * onStep:每一步引导回调
     * onStepNode:手动获取目标节点回调
     * onManualStep:手动开始引导步骤回调
     */
    public startGuide(guideId: number, args?: {
        onStep?: (stepIndex: number) => void,
        onStepNode?: (stepIndex: number, ui: UIBase) => Promise<Node>,
        onManualStep?: (stepIndex: number) => void
        onEnded?: () => void,
    }) {
        if (this._skipGuide) return;
        let { onStep, onStepNode, onManualStep, onEnded } = args || {};
        if (this._guideId != 0) {
            this._logger.trace("正在进引导: " + this._guideId + " 想要开始引导: " + guideId);
            return;
        }
        this._guideId = guideId;
        this._dataIndex = 0;
        this._guideData = GameTable.Inst.getGuideGroup(guideId);
        if (this._guideData != null) {
            this._logger.debug("开始引导" + guideId);
            App.event.emit(EventKey.OnGuideStart, this._guideId);
            this._onStep = onStep;
            this._onStepNode = onStepNode;
            this._onManualStep = onManualStep;
            this._onEnded = onEnded;
            this.showGuideStep();
        }
        else {
            this._logger.debug(`引导${this._guideId}数据错误`);
            this.guideOver();
        }
    }

    /** 手动开始引导步骤 */
    public startGuideStep(guideId: number, stepIndex: number, screenPos?: Vec3, eventTarget?: Node, hollowDuration = 0.25) {
        if (this._guideId != guideId) {
            this._logger.error("引导id不一致", this._guideId, guideId);
            return;
        }
        if (this.stepIndex != stepIndex) {
            this._logger.error("引导step不一致", this.stepIndex, stepIndex);
            return;
        }

        let guide = this._guideData[this._dataIndex];

        this._logger.debug(`手动开始引导 GuideId=${guideId} StepIndex=${stepIndex}`);

        if (guide.ClickScreen) {//点击屏幕
            this.showBtnScreen();
        } else {
            if (guide.NodeSize.x == 0 || guide.NodeSize.y == 0) {
                this._logger.error(`挖孔必须在表中指定NodeSize`);
                this.guideOver();
                return;
            }
            if (!screenPos || !eventTarget) {
                this._logger.error(`挖孔需要传入 挖孔位置和事件节点`);
                this.guideOver();
                return;
            }
            this.m_HollowTarget.position = CCUtils.screenPosToUINodePos(screenPos, this.m_HollowTarget.parent);
            this._hollowTargetTf.setContentSize(guide.NodeSize.x, guide.NodeSize.y);
            this.showHollowByTarget(this.m_HollowTarget, eventTarget, hollowDuration);
        }
        this.showPrefab();
        this.showTipAVG();
    }

    /** 手动结束引导步骤 */
    public endGuideStep(guideId: number, stepIndex: number) {
        if (this._guideId != guideId) {
            this._logger.error("引导id不一致", this._guideId, guideId);
            return;
        }
        if (this.stepIndex != stepIndex) {
            this._logger.error("引导step不一致", this.stepIndex, stepIndex);
            return;
        }
        this.checkOver();
    }

    private async showGuideStep() {
        if (this._guideData.length <= this._dataIndex) {
            this._logger.error(`引导${this._guideId} 数据索引${this._dataIndex} 数据错误`);
            return;
        }
        this._logger.debug();
        this._logger.debug("---------开始引导步骤", this._guideId, this.stepIndex);

        App.ui.blockTime = 99999;
        this.setMaskVisible(true)
        this.setMaskTouchEnable(true);
        this.m_Mask.reset();
        this.m_Ring.active = false;
        this.m_Finger.active = false;
        this.m_BtnScreen.active = false

        let guide = this._guideData[this._dataIndex];
        this.setShadeOpacity(guide.Opacity || 185)
        if (!guide.TipText) this.m_Tip.active = false;

        this._onStep && this._onStep(this.stepIndex);

        if (!guide.UIName.trim()) {//需要手动开始引导步骤
            this.waitManualStartStep();
        } else {
            let ui = await this.waitUIShow();
            if (guide.ClickScreen) {//点击屏幕
                this.showBtnScreen();
            } else {//点击指定节点
                let targetNode = await this.findTargetNode(ui);
                this.showHollowByTarget(targetNode.hollowTarget, targetNode.eventTarget);
            }
            this.showTipAVG();
            this.showPrefab();
        }
    }


    private async waitUIShow() {
        let guide = this._guideData[this._dataIndex];
        let uiName = UIConstant[guide.UIName];

        this._logger.debug(`guideId=${this._guideId} assignUIName=${uiName}`);

        let p = new Promise<UIBase>((resovle, reject) => {
            this.scheduleOnce(() => {
                this._logger.debug(`IsTopUI=${App.ui.isTopUI(uiName)}`);

                let checkUI = () => {
                    this._logger.debug(`${uiName} 已被打开`);
                    this._logger.debug(`isAnimEnd=${App.ui.getUI(uiName).isAnimEnd}`);
                    let ui = App.ui.getUI(uiName);
                    if (App.ui.getUI(uiName).isAnimEnd) {
                        resovle(ui);
                    } else {
                        ui.onAnimEnd.addListener(() => {
                            resovle(ui);
                        }, this, true);
                    }
                }

                if (App.ui.isTopUI(uiName)) {//UI已打开
                    checkUI();
                }
                else //等待UI被打开
                {
                    this._logger.debug(`${uiName} 等待被打开`);
                    let func = ui => {
                        if (App.ui.isTopUI(uiName)) {
                            App.event.off(EventKey.OnUIShow, func);
                            App.event.off(EventKey.OnUIHide, func);
                            checkUI();
                        }
                    };
                    App.event.on(EventKey.OnUIShow, func);
                    App.event.on(EventKey.OnUIHide, func);
                }
            }, Math.max(0.05, guide.DelayCheckUI));
        });
        return p;
    }

    private async waitManualStartStep() {
        this._logger.debug("等待手动开始引导步骤");
        this._onManualStep && this._onManualStep(this.stepIndex);
        App.event.emit(EventKey.ManualGuideStep, this._guideId, this.stepIndex);
    }


    private async showBtnScreen() {
        this._logger.debug("点击屏幕即可");
        this.m_BtnScreen.active = true
        this.m_BtnScreen.once(Button.EventType.CLICK, this.checkOver.bind(this));
        App.ui.blockTime = -1;
    }

    public async showPrefab() {
        let guide = this._guideData[this._dataIndex];
        this._logger.debug("加载预制体",guide.Prefab);
        let prefabNode: Node;
        if (this.m_PrefabParent.children.length > 0) {
            let nodeName = this.m_PrefabParent.children[0].name;
            if (nodeName != guide.Prefab) {
                this.destroyPrefab();
            } else {
                prefabNode = this.m_PrefabParent.children[0];
            }
        }
        if (!guide.Prefab) return;

        if (!prefabNode?.isValid) {
            let prefab = await AssetMgr.loadAsset("prefab/guide/" + guide.Prefab, Prefab);
            prefabNode = instantiate(prefab);
            prefabNode.parent = this.m_PrefabParent;
        }

        let comp = prefabNode.getComponent(GuidePrefab);
        if (comp) {
            comp.onClose.addListener(this.checkOver, this, true);
            comp.init(this._guideId, this.stepIndex);
        }
        App.ui.blockTime = -1;
    }

    /** 销毁加载的预制件 */
    private destroyPrefab() {
        if (this.m_PrefabParent.children.length > 0) {
            let nodeName = this.m_PrefabParent.children[0].name;
            this.m_PrefabParent.destroyAllChildren();
            AssetMgr.DecRef("prefab/guide/" + nodeName);
        }
    }


    /** 获取UI上的目标节点 */
    private async findTargetNode(ui: UIBase) {
        let guide = this._guideData[this._dataIndex];
        let btnNode: Node;
        if (!guide.NodePath.trim()) {
            btnNode = await this._onStepNode(this.stepIndex, ui);
            if (!btnNode?.isValid) {
                this._logger.error(`引导${this._guideId} 第${this.stepIndex}步 目标节点未找到`);
                return;
            }
        }
        else {
            btnNode = CCUtils.getNodeAtPath(ui.node, guide.NodePath);
        }
        if (btnNode) {
            let result: { hollowTarget: Node, eventTarget: Node } = { hollowTarget: btnNode, eventTarget: btnNode };
            if (guide.NodeSize.x > 0 && guide.NodeSize.y > 0) {
                this.m_HollowTarget.position = CCUtils.uiNodePosToUINodePos(btnNode, this.node, v3(0, 0));
                this._hollowTargetTf.setContentSize(guide.NodeSize.x, guide.NodeSize.y);
                result.hollowTarget = this.m_HollowTarget;
            }
            return result;
        }
        else {
            this._logger.error(`引导${this._guideId} 第${this.stepIndex}步 未找到指定Node`);
            this.guideOver();
            return null;
        }
    }

    /** 展示挖孔 并且可以点击挖孔区域 */
    private showHollowByTarget(hollowTarget?: Node, eventTarget?: Node, duration = 0.25) {
        let guide = this._guideData[this._dataIndex];
        if (hollowTarget) {
            this.m_Mask.hollow(guide.HollowType == 1 ? EMaskHollowType.Rect : EMaskHollowType.Circle, hollowTarget, eventTarget, guide.HollowScale, duration);
            eventTarget.once("click", this.checkOver.bind(this));
            this._logger.debug(`挖孔Size width=${this._hollowTargetTf.width} height=${this._hollowTargetTf.height}`);
            this.scheduleOnce(() => {
                App.ui.blockTime = -1;
                let pos = CCUtils.uiNodePosToUINodePos(hollowTarget.parent, this.node, hollowTarget.position);
                this.showRing(guide.RingScale, pos, guide.RingOffset);
                this.showFinger(guide.FingerDir, pos, guide.FingerOffset);
            }, duration + 0.05);
        }
    }



    /** 展示提示文字对话框 */
    private showTipAVG() {
        let guide = this._guideData[this._dataIndex];
        this.showTipText(guide.TipText, guide.TipPos);
    }

    /** 设置遮罩可见性 */
    private setMaskVisible(visible: boolean) {
        this.m_Mask.node.active = visible;
    }

    /** 遮罩是否接收触摸事件 */
    public setMaskTouchEnable(enable: boolean) {
        this.m_Mask.setTouchEnable(enable);
    }

    /** 自定义挖孔 仅挖孔不可点击  */
    public showCustomHollow(type: EMaskHollowType, screenPos: Vec3, size: Size, duration = 0.25) {
        this.m_HollowTarget.position = CCUtils.screenPosToUINodePos(screenPos, this.m_HollowTarget.parent);
        this._hollowTargetTf.width = size.width;
        this._hollowTargetTf.height = size.height;
        this.m_Mask.hollow2(type, this.m_HollowTarget, 1, duration);
    }

    /** 设置遮罩透明度 */
    public setShadeOpacity(opacity: number, dur = 0.15, onEnded?: () => void) {
        let uiOpacity = this.m_Mask.getComponent(UIOpacity);
        if (opacity == uiOpacity.opacity) return;
        Tween.stopAllByTarget(this.m_Mask.node);
        if (dur == 0) {
            uiOpacity.opacity = opacity;
            onEnded && onEnded();
        } else {
            tween(uiOpacity).to(dur, { opacity: opacity }).call(onEnded).start();
        }
    }

    /** 显示圆圈 */
    public showRing(scale: number, pos: Vec3, offset: Vector2) {
        this.m_Ring.active = true;
        this.m_Ring.setScale(scale, scale);
        this.m_Ring.position = pos.add(v3(offset.x, offset.y));
    }

    /** 显示手指 */
    public showFinger(dir: number, pos: Vec3, offset: Vector2) {
        if (dir == 0) {
            this.m_Finger.active = false;
        }
        else {
            dir = misc.clampf(dir, 1, 4);
            this.m_Finger.active = true;
            this.m_Finger.position = pos.add(v3(offset.x, offset.y));
            switch (dir) {
                case 1:
                    this.m_Finger.angle = 0;
                    break;
                case 2:
                    this.m_Finger.angle = 180;
                    break;
                case 3:
                    this.m_Finger.angle = 90;
                    break;
                case 4:
                    this.m_Finger.angle = -90;
                    break;
            }
        }
    }

    /** 展示提示文字 */
    public showTipText(text: string, pos: Vector2) {
        if (!text || !text.trim()) {
            this.m_Tip.active = false;
        }
        else {
            this.m_Tip.active = true;
            this.m_Tip.position = v3(pos.x, pos.y);
            let lbl = this.m_Tip.getComponentInChildren(Label);
            lbl.string = App.l10n.getStringByKey(text);
        }
    }

}