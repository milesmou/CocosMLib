import { Button, EventTouch, Label, Node, Prefab, Size, Tween, UIOpacity, Vec3, _decorator, instantiate, misc, tween, v3, view } from 'cc';
import { AssetMgr } from '../../../mlib/module/asset/AssetMgr';
import { ELoggerLevel } from '../../../mlib/module/logger/ELoggerLevel';
import { UIComponent } from '../../../mlib/module/ui/manager/UIComponent';
import { UIForm } from '../../../mlib/module/ui/manager/UIForm';
import { UIConstant } from '../../gen/UIConstant';
import { TGuide, vector2 } from '../../gen/table/schema';
import GameTable from '../GameTable';
import { EMaskHollowType, GuideMask } from './GuideMask';
import { GuidePrefab } from './GuidePrefab';
const { ccclass, property } = _decorator;

/** 引导步骤完成方式 */
enum EFinishStepType {
    /** 手动 */
    Manual,
    /** 点击挖孔 */
    ClickHollow,
    /** 点击屏幕 */
    ClickScreen,
    /** 延时完成 */
    Delay
}


@ccclass
export class UIGuide extends UIComponent {

    public static Inst: UIGuide;

    private _logger = mLogger.new("Guide", ELoggerLevel.Debug);

    private get mask() { return this.rc.get("Mask", GuideMask); }
    private get ring() { return this.rc.get("Ring", Node); }
    private get finger() { return this.rc.get("Finger", Node); }
    private get tip() { return this.rc.get("Tip", Node); }
    private get btnScreen() { return this.rc.get("BtnScreen", Node); }
    private get prefabParent() { return this.rc.get("PrefabParent", Node); }
    private get debug() { return this.rc.get("Debug", Node); }

    /** 遮罩默认透明度 */
    private _maskOpacity = 0;

    public get isGuide() { return this._guideId > 0; }
    public get nowGuide() { return this._guideId; }
    public get stepId() {
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
    private _onStep?: (stepId: number) => void;
    private _onManualStep?: (stepId: number) => void;
    private _onEnded: () => void;

    protected onLoad() {
        UIGuide.Inst = this;

        this.hide(true);

        this.mask.onClickSucc.addListener(() => {
            this._logger.warn(`点击挖孔成功`);
            this.checkOver();
        });

        if (this.debug.active) {
            this.enableDebug();
        }
    }


    private hide(fast = false) {
        this._maskOpacity = this.mask.getComponent(UIOpacity).opacity;
        this.setShadeOpacity(0, fast ? 0 : 0.15, () => {
            this.mask.node.active = false;
        });
        this.ring.active = false;
        this.finger.active = false;
        this.tip.active = false;
        this.btnScreen.active = false;
        this.destroyPrefab();
    }

    private guideOver() {
        app.event.emit(mEventKey.OnGuideEnd, this._guideId);
        this._guideId = 0;
        this.hide();
        this._onEnded && this._onEnded();
        this._onEnded = null;
    }

    private checkOver() {
        this._logger.debug("---------结束引导步骤", this._guideId, this.stepId);
        this._logger.debug();
        let data = this._guideData[this._dataIndex];
        app.chan.reportEvent(mReportEvent.GuideStep, { k: data.ID });
        if (this._dataIndex == this._guideData.length - 1) {
            this._logger.debug("结束引导" + this._guideId);
            this.guideOver();
        }
        else {
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
        onStep?: (stepId: number) => void,
        onManualStep?: (stepId: number) => void
        onEnded?: () => void,
    }) {
        let { onStep, onManualStep, onEnded } = args || {};
        if (this._guideId != 0) {
            this._logger.warn("正在进引导: " + this._guideId + " 想要开始引导: " + guideId);
            return;
        }
        this._guideId = guideId;
        this._dataIndex = 0;
        this._guideData = GameTable.Inst.getGuideGroup(guideId);
        if (this._guideData?.length > 0) {
            this._logger.debug("开始引导" + guideId);
            app.event.emit(mEventKey.OnGuideStart, this._guideId);
            this._onStep = onStep;
            this._onManualStep = onManualStep;
            this._onEnded = onEnded;
            if (mGameSetting.skipGuide) {
                this.guideOver();
                return;
            }
            this.showGuideStep();
        }
        else {
            this._logger.debug(`引导${this._guideId}数据错误`);
            this.guideOver();
        }
    }

    /** 手动开始引导步骤 */
    public startGuideStep(guideId: number, stepId: number) {
        if (this._guideId != guideId) {
            this._logger.error("引导id不一致", this._guideId, guideId);
            return;
        }
        if (this.stepId != stepId) {
            this._logger.error("引导stepId不一致", this.stepId, stepId);
            return;
        }

        this._logger.debug(`手动开始引导 GuideId=${guideId} StepId=${stepId}`);

        this.showHollow();
        this.showBtnScreen();
        this.delayFinishStep();
        this.showPrefab();
        this.showTipAVG();
    }

    /** 手动结束引导步骤 */
    public endGuideStep(guideId: number, stepId: number) {
        if (this._guideId != guideId) {
            this._logger.error("引导id不一致", this._guideId, guideId);
            return;
        }
        if (this.stepId != stepId) {
            this._logger.error("引导stepId不一致", this.stepId, stepId);
            return;
        }
        this.checkOver();
    }

    private showGuideStep() {
        if (this._guideData.length <= this._dataIndex) {
            this._logger.error(`引导${this._guideId} 步骤索引${this._dataIndex} 数据错误`);
            return;
        }
        this._logger.debug();
        this._logger.debug("---------开始引导步骤", this._guideId, this.stepId);
        let guide = this._guideData[this._dataIndex];

        app.ui.blockTime = 99999;
        this.setMaskVisible(true)
        this.setMaskTouchEnable(true);
        if (!guide.HollowKeep) this.mask.reset();
        this.ring.active = false;
        this.finger.active = false;
        this.btnScreen.active = false

        this.setShadeOpacity(guide.Opacity < 0 ? 0 : (guide.Opacity || this._maskOpacity));
        if (!guide.TipText || guide.Delay > 0) this.tip.active = false;

        this.scheduleOnce(() => {
            this._onStep && this._onStep(this.stepId);

            if (guide.FinishStepType == EFinishStepType.Manual) {//需要手动开始引导步骤
                this.waitManualStartStep();
            } else {
                this.waitUIShow().then(() => {
                    this.showHollow();
                    this.showBtnScreen();
                    this.delayFinishStep();
                    this.showTipAVG();
                    this.showPrefab();
                });
            }
        }, Math.max(0.05, guide.Delay))
    }


    private async waitUIShow() {
        let guide = this._guideData[this._dataIndex];
        let uiName = UIConstant[guide.UIName];

        this._logger.debug(`guideId=${this._guideId} assignUIName=${uiName}`);

        let p = new Promise<UIForm>((resovle, reject) => {
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
                        app.event.off(mEventKey.OnUIShow, func);
                        app.event.off(mEventKey.OnUIHide, func);
                        checkUI();
                    }
                };
                app.event.on(mEventKey.OnUIShow, func);
                app.event.on(mEventKey.OnUIHide, func);
            }
        });
        return p;
    }

    private async waitManualStartStep() {
        this._logger.debug("等待手动开始引导步骤");
        this._onManualStep && this._onManualStep(this.stepId);
        app.event.emit(mEventKey.ManualGuideStep, this._guideId, this.stepId);
    }

    private async showBtnScreen() {
        let guide = this._guideData[this._dataIndex];
        if (guide.FinishStepType != EFinishStepType.ClickScreen) return;
        this._logger.debug("点击屏幕即可");
        this.btnScreen.active = true
        this.btnScreen.once(Button.EventType.CLICK, this.checkOver.bind(this));
        app.ui.blockTime = -1;
    }

    private async delayFinishStep() {
        let guide = this._guideData[this._dataIndex];
        if (guide.FinishStepType != EFinishStepType.Delay) return;
        this._logger.debug(`延迟${guide.FinishStepDelay}秒 完成本步引导`);
        this.scheduleOnce(() => {
            app.ui.blockTime = -1;
            this.checkOver();
        }, guide.FinishStepDelay);
    }

    private async showPrefab() {
        let guide = this._guideData[this._dataIndex];
        this._logger.debug("加载预制体", guide.Prefab);
        let prefabNode: Node;
        if (this.prefabParent.children.length > 0) {
            let nodeName = this.prefabParent.children[0].name;
            if (nodeName != guide.Prefab) {
                this.destroyPrefab();
            } else {
                prefabNode = this.prefabParent.children[0];
            }
        }
        if (!guide.Prefab) return;

        if (!prefabNode?.isValid) {
            let prefab = await AssetMgr.loadAsset("prefab/guide/" + guide.Prefab, Prefab);
            prefabNode = instantiate(prefab);
            prefabNode.parent = this.prefabParent;
        }

        let comp = prefabNode.getComponent(GuidePrefab);
        if (comp) {
            comp.onClose.addListener(this.checkOver, this, true);
            comp.init(this._guideId, this.stepId);
        }
        app.ui.blockTime = -1;
    }

    /** 销毁加载的预制件 */
    private destroyPrefab() {
        if (this.prefabParent.children.length > 0) {
            let nodeName = this.prefabParent.children[0].name;
            this.prefabParent.destroyAllChildren();
            AssetMgr.decRef("prefab/guide/" + nodeName);
        }
    }


    /** 展示挖孔 */
    private showHollow() {
        let guide = this._guideData[this._dataIndex];
        if (guide.HollowPos && guide.HollowSize) {
            let hollowPos = this.fixupHollowPos();
            let hollowSize = new Size(guide.HollowSize.x, guide.HollowSize.y);
            let hollowType = guide.HollowType == 1 ? EMaskHollowType.Rect : EMaskHollowType.Circle;
            let hollowAnimDur = guide.HollowAnimDur < 0 ? 0 : (guide.HollowAnimDur || 0.25);
            this.mask.hollow(hollowType, hollowPos, hollowSize, guide.HollowScale, hollowAnimDur, guide.FinishStepType == EFinishStepType.ClickHollow);
            this._logger.debug(`挖孔Size width=${hollowSize.width} height=${hollowSize.height}`);
            this.scheduleOnce(() => {
                app.ui.blockTime = -1;
                this.showRing(guide.RingScale, hollowPos.clone(), guide.RingOffset);
                this.showFinger(guide.FingerDir, hollowPos.clone(), guide.FingerOffset);
            }, hollowAnimDur + 0.05);
        }

    }

    /** 展示自定义挖孔 挖孔不可点击  */
    public showCustomHollow(type: EMaskHollowType, screenPos: Vec3, size: Size, duration = 0.25, canClick = true) {
        this.mask.hollow(type, screenPos, size, 1, duration, canClick);
    }

    private fixupHollowPos() {
        let guide = this._guideData[this._dataIndex];
        if (guide.HollowAlign.length >= 2) {
            let viewSize = view.getVisibleSize();
            let x = guide.HollowPos.x;
            let y = guide.HollowPos.y;
            let align = guide.HollowAlign[0];
            let dist = guide.HollowAlign[1];
            switch (align) {
                case 1://向上停靠
                    y = viewSize.height - dist - guide.HollowSize.y / 2;
                    break;
                case 2://向下停靠
                    y = dist + guide.HollowSize.y / 2;
                    break;
                case 3://向左停靠
                    x = dist + guide.HollowSize.x / 2;
                    break;
                case 4://向右停靠
                    x = viewSize.width - dist - guide.HollowSize.x / 2;
                    break;
                default:
                    this._logger.error(`错误的对齐方式`, align, guide);
                    break;
            }

            return v3(x, y);

        } else {
            return v3(guide.HollowPos.x, guide.HollowPos.y);
        }
    }


    /** 展示提示文字对话框 */
    private showTipAVG() {
        let guide = this._guideData[this._dataIndex];
        this.showTipText(guide.TipText, guide.TipPos);
    }

    /** 设置遮罩可见性 */
    private setMaskVisible(visible: boolean) {
        this.mask.node.active = visible;
    }

    /** 遮罩是否接收触摸事件 */
    public setMaskTouchEnable(enable: boolean) {
        this.mask.setTouchEnable(enable);
    }

    /** 设置遮罩透明度 */
    public setShadeOpacity(opacity: number, dur = 0.15, onEnded?: () => void) {
        let uiOpacity = this.mask.getComponent(UIOpacity);
        if (opacity == uiOpacity.opacity) return;
        Tween.stopAllByTarget(this.mask.node);
        if (dur == 0) {
            uiOpacity.opacity = opacity;
            onEnded && onEnded();
        } else {
            tween(uiOpacity).to(dur, { opacity: opacity }).call(onEnded).start();
        }
    }

    /** 显示圆圈 */
    public showRing(scale: number, pos: Vec3, offset: vector2) {
        this.ring.active = true;
        this.ring.setScale(scale, scale);
        if (offset) {
            pos.add(v3(offset.x, offset.y))
        }
        this.ring.position = pos;
    }

    /** 显示手指 */
    public showFinger(dir: number, pos: Vec3, offset: vector2) {
        if (dir == 0) {
            this.finger.active = false;
        }
        else {
            dir = misc.clampf(dir, 1, 4);
            this.finger.active = true;
            if (offset) {
                pos.add(v3(offset.x, offset.y))
            }
            this.finger.position = pos;
            switch (dir) {
                case 1:
                    this.finger.angle = 0;
                    break;
                case 2:
                    this.finger.angle = 180;
                    break;
                case 3:
                    this.finger.angle = 90;
                    break;
                case 4:
                    this.finger.angle = -90;
                    break;
            }
        }
    }

    /** 展示提示文字 */
    public showTipText(text: string, pos: vector2) {
        if (!text || !text.trim()) {
            this.tip.active = false;
        }
        else {
            this.tip.active = true;
            this.tip.position = pos ? v3(pos.x, pos.y) : v3(0, 0);
            let lbl = this.tip.getComponentInChildren(Label);
            // lbl.string = app.l10n.getStringByKey(text);
            lbl.string = text;
        }
    }


    private enableDebug() {
        let logger = mLogger.new("Guide Node");
        Node.prototype.dispatchEvent = function (event: EventTouch) {
            let self: Node = this;
            if (event.type == "touch-end") {//点击事件
                let viewSize = view.getVisibleSize();
                let pos = event.getUILocation();
                pos.x = Math.floor(pos.x);
                pos.y = Math.floor(pos.y);
                let aabb = self.transform.getComputeAABB();
                let nodePos = self.transform.convertToWorldSpaceAR(v3(0, 0));
                nodePos.x = Math.floor(nodePos.x);
                nodePos.y = Math.floor(nodePos.y);
                logger.debug("------------------------------")
                logger.debug("ClickPos " + `${pos.x - viewSize.width / 2},${pos.y - viewSize.height / 2}`);
                logger.debug("NodePath " + self.getPath());
                logger.debug("NodePostion " + `${nodePos.x - viewSize.width / 2},${nodePos.y - viewSize.height / 2}`);
                logger.debug("NodeSize " + `${Math.floor(aabb.halfExtents.x * 2)},${Math.floor(aabb.halfExtents.y * 2)}`);
                let top = viewSize.height - aabb.center.y - aabb.halfExtents.y;
                let bottom = aabb.center.y - aabb.halfExtents.y;
                let left = aabb.center.x - aabb.halfExtents.x;
                let right = viewSize.width - aabb.center.x - aabb.halfExtents.x;
                logger.debug("NodeMargin " + `Top:${Math.floor(top)}|Bottom:${Math.floor(bottom)}|Left:${Math.floor(left)}|Right:${Math.floor(right)}`);
                logger.debug("------------------------------")
            }
            this._eventProcessor.dispatchEvent(event);
        }
    }
}