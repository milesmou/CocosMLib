"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaceComponent = void 0;
const cc_1 = require("cc");
const MLogger_1 = require("./tools/MLogger");
class ReplaceComponent {
    static replace() {
        this.replaceButton();
        this.replaceToggle();
    }
    static replaceButton() {
        let buttons = cc_1.director.getScene().getComponentsInChildren(cc_1.Button);
        let btnCnt = 0;
        buttons.forEach(v => {
            if (cc_1.js.getClassName(v) != "cc.Button")
                return;
            if (v.getComponent("MButton"))
                return;
            btnCnt++;
            let mBtn = v.node.addComponent("MButton");
            mBtn.enabled = v.enabled;
            mBtn.target = v.target;
            mBtn.clickEvents = v.clickEvents;
            mBtn.interactable = v.interactable;
            mBtn.transition = v.transition;
            mBtn.duration = v.duration;
            mBtn.zoomScale = v.zoomScale;
            mBtn.hoverColor = v.hoverColor;
            mBtn.normalColor = v.normalColor;
            mBtn.pressedColor = v.pressedColor;
            mBtn.disabledColor = v.disabledColor;
            mBtn.hoverSprite = v.hoverSprite;
            mBtn.normalSprite = v.normalSprite;
            mBtn.pressedSprite = v.pressedSprite;
            mBtn.disabledSprite = v.disabledSprite;
            v.destroy();
        });
        MLogger_1.MLogger.info(`替换Button为MButton完成,共计${btnCnt}个`);
    }
    static replaceToggle() {
        let toggles = cc_1.director.getScene().getComponentsInChildren(cc_1.Toggle);
        let btnCnt = 0;
        toggles.forEach(tog => {
            if (cc_1.js.getClassName(tog) != "cc.Toggle")
                return;
            if (tog.getComponent("MToggle"))
                return;
            btnCnt++;
            let mTog = tog.addComponent("MToggle");
            mTog.enabled = tog.enabled;
            mTog.target = tog.target;
            mTog.isChecked = tog.isChecked;
            mTog.checkMark = tog.checkMark;
            mTog.clickEvents = tog.clickEvents;
            mTog.checkEvents = tog.checkEvents;
            mTog.interactable = tog.interactable;
            mTog.transition = tog.transition;
            mTog.duration = tog.duration;
            mTog.zoomScale = tog.zoomScale;
            mTog.hoverColor = tog.hoverColor;
            mTog.normalColor = tog.normalColor;
            mTog.pressedColor = tog.pressedColor;
            mTog.disabledColor = tog.disabledColor;
            mTog.hoverSprite = tog.hoverSprite;
            mTog.normalSprite = tog.normalSprite;
            mTog.pressedSprite = tog.pressedSprite;
            mTog.disabledSprite = tog.disabledSprite;
            mTog.playEffect();
            tog.destroy();
        });
        MLogger_1.MLogger.info(`替换Toggle为MToggle完成,共计${btnCnt}个`);
    }
}
exports.ReplaceComponent = ReplaceComponent;
