import { Button, Label, Node, Prefab, Size, Tween, UIOpacity, UITransform, Vec3, _decorator, instantiate, misc, tween, v3 } from 'cc';
import { AssetMgr } from '../../../mlib/module/asset/AssetMgr';
import { ELoggerLevel } from '../../../mlib/module/logger/ELoggerLevel';
import { UIBase } from '../../../mlib/module/ui/manager/UIBase';
import { UIComponent } from '../../../mlib/module/ui/manager/UIComponent';
import { UIForm } from '../../../mlib/module/ui/manager/UIForm';
import { CCUtils } from '../../../mlib/utils/CCUtil';
import { UIConstant } from '../../gen/UIConstant';
import { TGuide, Vector2 } from '../../gen/table/Types';
import { EventKey } from '../GameEnum';
import GameTable from '../GameTable';
import { EMaskHollowType, GuideMask } from './GuideMask';
import { GuidePrefab } from './GuidePrefab';
const { ccclass, property } = _decorator;


@ccclass
export class UIGuide extends UIComponent {

    public static Inst: UIGuide;

    private _logger = logger.new("Guide", ELoggerLevel.Warn);

    private _mask: GuideMask = null;
    private _ring: Node = null;
    private _finger: Node = null;
    private _tip: Node = null;
    private _hollowTarget: Node = null;
    private _btnScreen: Node = null;
    private _prefabParent: Node = null;
    private _hollowTargetTf: UITransform;

    public get isGuide() { return this._guideId > 0; }
    public get nowGuide() { return this._guideId; }
    public get stepKey() {
        if (this._guideData?.length > 0) {
            if (this._dataIndex > -1 && this._dataIndex < this._guideData.length) {
                return this._guideData[this._dataIndex].StepId;
            }
        }
        return -1;
    }

    private _guideId: number = 0;
    private _guideData: TGuide[] = [];
    private _dataIndex: number;// 数据索引 从_guideData中取值使用
    private _onStep?: (stepKey: number) => void;
    private _onStepNode?: (stepKey: number, ui: UIForm) => Promise<Node>;
    private _onManualStep?: (stepKey: number) => void;
    private _onEnded: () => void;

    private _skipGuide = false;//关闭所有引导


    onLoad() {
        UIGuide.Inst = this;

        this._mask = this.rc.get("Mask", GuideMask);
        this._ring = this.rc.getNode("Ring");
        this._finger = this.rc.getNode("Finger");
        this._tip = this.rc.getNode("Tip");
        this._hollowTarget = this.rc.getNode("HollowTarget");
        this._btnScreen = this.rc.getNode("BtnScreen");
        this._prefabParent = this.rc.getNode("Prefab");
        this._hollowTargetTf = this._hollowTarget.getComponent(UITransform);

        this.hide(true);
        this._mask.onEventTargetInvalid.addListener(() => {
            this._logger.warn(`事件节点已销毁 跳过本步引导`);
            this.checkOver();
        })
    }


    private hide(fast = false) {
        this.setShadeOpacity(0, fast ? 0 : 0.15, () => {
            this._mask.node.active = false;
        });
        this._ring.active = false;
        this._finger.active = false;
        this._tip.active = false;
        this._btnScreen.active = false;
        this.destroyPrefab();
    }

    private guideOver() {
        app.event.emit(EventKey.OnGuideEnd, this._guideId);
        this._guideId = 0;
        this.hide();
        this._onEnded && this._onEnded();
        this._onEnded = null;
    }

    private checkOver() {
        this._logger.debug("---------结束引导步骤", this._guideId, this.stepKey);
        this._logger.debug();
        let data = this._guideData[this._dataIndex];
        app.chan.reportEvent("guide_step", { k: data.ID });
        if (this._dataIndex == this._guideData.length - 1) {
            this._logger.debug("结束引导" + this._guideId);
            this.guideOver();
        }
        else {
            this._mask.reset();
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
        onStep?: (stepKey: number) => void,
        onStepNode?: (stepKey: number, ui: UIBase) => Promise<Node>,
        onManualStep?: (stepKey: number) => void
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
            app.event.emit(EventKey.OnGuideStart, this._guideId);
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
    public startGuideStep(guideId: number, stepKey: number, screenPos?: Vec3, eventTarget?: Node, hollowDuration = 0.25) {
        if (this._guideId != guideId) {
            this._logger.error("引导id不一致", this._guideId, guideId);
            return;
        }
        if (this.stepKey != stepKey) {
            this._logger.error("引导step不一致", this.stepKey, stepKey);
            return;
        }

        let guide = this._guideData[this._dataIndex];

        this._logger.debug(`手动开始引导 GuideId=${guideId} StepIndex=${stepKey}`);

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
            this._hollowTarget.position = CCUtils.screenPosToUINodePos(screenPos, this._hollowTarget.parent);
            this._hollowTargetTf.setContentSize(guide.NodeSize.x, guide.NodeSize.y);
            this.showHollowByTarget(this._hollowTarget, eventTarget, hollowDuration);
        }
        this.showPrefab();
        this.showTipAVG();
    }

    /** 手动结束引导步骤 */
    public endGuideStep(guideId: number, stepKey: number) {
        if (this._guideId != guideId) {
            this._logger.error("引导id不一致", this._guideId, guideId);
            return;
        }
        if (this.stepKey != stepKey) {
            this._logger.error("引导step不一致", this.stepKey, stepKey);
            return;
        }
        this.checkOver();
    }

    private async showGuideStep() {
        if (this._guideData.length <= this._dataIndex) {
            this._logger.error(`引导${this._guideId} 步骤索引${this._dataIndex} 数据错误`);
            return;
        }
        this._logger.debug();
        this._logger.debug("---------开始引导步骤", this._guideId, this.stepKey);

        app.ui.blockTime = 99999;
        this.setMaskVisible(true)
        this.setMaskTouchEnable(true);
        this._mask.reset();
        this._ring.active = false;
        this._finger.active = false;
        this._btnScreen.active = false

        let guide = this._guideData[this._dataIndex];
        this.setShadeOpacity(guide.Opacity || 185)
        if (!guide.TipText) this._tip.active = false;

        this._onStep && this._onStep(this.stepKey);

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

        let p = new Promise<UIForm>((resovle, reject) => {
            this.scheduleOnce(() => {
                this._logger.debug(`IsTopUI=${app.ui.isTopUI(uiName)}`);

                let checkUI = () => {
                    this._logger.debug(`${uiName} 已被打开`);
                    this._logger.debug(`isAnimEnd=${app.ui.getUI(uiName).isAnimEnd}`);
                    let ui = app.ui.getUI(uiName);
                    if (app.ui.getUI(uiName).isAnimEnd) {
                        resovle(ui);
                    } else {
                        ui.onAnimEnd.addListener(() => {
                            resovle(ui);
                        }, this, true);
                    }
                }

                if (app.ui.isTopUI(uiName)) {//UI已打开
                    checkUI();
                }
                else //等待UI被打开
                {
                    this._logger.debug(`${uiName} 等待被打开`);
                    let func = ui => {
                        if (app.ui.isTopUI(uiName)) {
                            app.event.off(EventKey.OnUIShow, func);
                            app.event.off(EventKey.OnUIHide, func);
                            checkUI();
                        }
                    };
                    app.event.on(EventKey.OnUIShow, func);
                    app.event.on(EventKey.OnUIHide, func);
                }
            }, Math.max(0.05, guide.DelayCheckUI));
        });
        return p;
    }

    private async waitManualStartStep() {
        this._logger.debug("等待手动开始引导步骤");
        this._onManualStep && this._onManualStep(this.stepKey);
        app.event.emit(EventKey.ManualGuideStep, this._guideId, this.stepKey);
    }


    private async showBtnScreen() {
        this._logger.debug("点击屏幕即可");
        this._btnScreen.active = true
        this._btnScreen.once(Button.EventType.CLICK, this.checkOver.bind(this));
        app.ui.blockTime = -1;
    }

    public async showPrefab() {
        let guide = this._guideData[this._dataIndex];
        this._logger.debug("加载预制体", guide.Prefab);
        let prefabNode: Node;
        if (this._prefabParent.children.length > 0) {
            let nodeName = this._prefabParent.children[0].name;
            if (nodeName != guide.Prefab) {
                this.destroyPrefab();
            } else {
                prefabNode = this._prefabParent.children[0];
            }
        }
        if (!guide.Prefab) return;

        if (!prefabNode?.isValid) {
            let prefab = await AssetMgr.loadAsset("prefab/guide/" + guide.Prefab, Prefab);
            prefabNode = instantiate(prefab);
            prefabNode.parent = this._prefabParent;
        }

        let comp = prefabNode.getComponent(GuidePrefab);
        if (comp) {
            comp.onClose.addListener(this.checkOver, this, true);
            comp.init(this._guideId, this.stepKey);
        }
        app.ui.blockTime = -1;
    }

    /** 销毁加载的预制件 */
    private destroyPrefab() {
        if (this._prefabParent.children.length > 0) {
            let nodeName = this._prefabParent.children[0].name;
            this._prefabParent.destroyAllChildren();
            AssetMgr.decRef("prefab/guide/" + nodeName);
        }
    }


    /** 获取UI上的目标节点 */
    private async findTargetNode(ui: UIForm) {
        let guide = this._guideData[this._dataIndex];
        let btnNode: Node;
        if (!guide.NodePath.trim()) {
            btnNode = await this._onStepNode(this.stepKey, ui);
            if (!btnNode?.isValid) {
                this._logger.error(`引导${this._guideId} 第${this.stepKey}步 目标节点未找到`);
                return;
            }
        }
        else {
            btnNode = ui.node.getChildByPath(guide.NodePath);
        }
        if (btnNode) {
            let result: { hollowTarget: Node, eventTarget: Node } = { hollowTarget: btnNode, eventTarget: btnNode };
            if (guide.NodeSize.x > 0 && guide.NodeSize.y > 0) {
                this._hollowTarget.position = CCUtils.uiNodePosToUINodePos(btnNode, this.node, v3(0, 0));
                this._hollowTargetTf.setContentSize(guide.NodeSize.x, guide.NodeSize.y);
                result.hollowTarget = this._hollowTarget;
            }
            return result;
        }
        else {
            this._logger.error(`引导${this._guideId} 第${this.stepKey}步 未找到指定Node`);
            this.guideOver();
            return null;
        }
    }

    /** 展示挖孔 并且可以点击挖孔区域 */
    private showHollowByTarget(hollowTarget?: Node, eventTarget?: Node, duration = 0.25) {
        let guide = this._guideData[this._dataIndex];
        if (hollowTarget) {
            this._mask.hollow(guide.HollowType == 1 ? EMaskHollowType.Rect : EMaskHollowType.Circle, hollowTarget, eventTarget, guide.HollowScale, duration);
            eventTarget.once("click", this.checkOver.bind(this));
            this._logger.debug(`挖孔Size width=${this._hollowTargetTf.width} height=${this._hollowTargetTf.height}`);
            this.scheduleOnce(() => {
                app.ui.blockTime = -1;
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
        this._mask.node.active = visible;
    }

    /** 遮罩是否接收触摸事件 */
    public setMaskTouchEnable(enable: boolean) {
        this._mask.setTouchEnable(enable);
    }

    /** 自定义挖孔 仅挖孔不可点击  */
    public showCustomHollow(type: EMaskHollowType, screenPos: Vec3, size: Size, duration = 0.25) {
        this._hollowTarget.position = CCUtils.screenPosToUINodePos(screenPos, this._hollowTarget.parent);
        this._hollowTargetTf.width = size.width;
        this._hollowTargetTf.height = size.height;
        this._mask.hollow2(type, this._hollowTarget, 1, duration);
    }

    /** 设置遮罩透明度 */
    public setShadeOpacity(opacity: number, dur = 0.15, onEnded?: () => void) {
        let uiOpacity = this._mask.getComponent(UIOpacity);
        if (opacity == uiOpacity.opacity) return;
        Tween.stopAllByTarget(this._mask.node);
        if (dur == 0) {
            uiOpacity.opacity = opacity;
            onEnded && onEnded();
        } else {
            tween(uiOpacity).to(dur, { opacity: opacity }).call(onEnded).start();
        }
    }

    /** 显示圆圈 */
    public showRing(scale: number, pos: Vec3, offset: Vector2) {
        this._ring.active = true;
        this._ring.setScale(scale, scale);
        this._ring.position = pos.add(v3(offset.x, offset.y));
    }

    /** 显示手指 */
    public showFinger(dir: number, pos: Vec3, offset: Vector2) {
        if (dir == 0) {
            this._finger.active = false;
        }
        else {
            dir = misc.clampf(dir, 1, 4);
            this._finger.active = true;
            this._finger.position = pos.add(v3(offset.x, offset.y));
            switch (dir) {
                case 1:
                    this._finger.angle = 0;
                    break;
                case 2:
                    this._finger.angle = 180;
                    break;
                case 3:
                    this._finger.angle = 90;
                    break;
                case 4:
                    this._finger.angle = -90;
                    break;
            }
        }
    }

    /** 展示提示文字 */
    public showTipText(text: string, pos: Vector2) {
        if (!text || !text.trim()) {
            this._tip.active = false;
        }
        else {
            this._tip.active = true;
            this._tip.position = v3(pos.x, pos.y);
            let lbl = this._tip.getComponentInChildren(Label);
            lbl.string = app.l10n.getStringByKey(text);
        }
    }

}