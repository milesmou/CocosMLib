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
        toggles.forEach(v => {
            if (cc_1.js.getClassName(v) != "cc.Toggle")
                return;
            if (v.getComponent("MToggle"))
                return;
            btnCnt++;
            let mTog = v.node.addComponent("MToggle");
            mTog.enabled = v.enabled;
            mTog.target = v.target;
            mTog.isChecked = v.isChecked;
            mTog.clickEvents = v.clickEvents;
            mTog.checkEvents = v.checkEvents;
            mTog.interactable = v.interactable;
            mTog.transition = v.transition;
            mTog.duration = v.duration;
            mTog.zoomScale = v.zoomScale;
            mTog.hoverColor = v.hoverColor;
            mTog.normalColor = v.normalColor;
            mTog.pressedColor = v.pressedColor;
            mTog.disabledColor = v.disabledColor;
            mTog.hoverSprite = v.hoverSprite;
            mTog.normalSprite = v.normalSprite;
            mTog.pressedSprite = v.pressedSprite;
            mTog.disabledSprite = v.disabledSprite;
            v.destroy();
        });
        MLogger_1.MLogger.info(`替换Toggle为MToggle完成,共计${btnCnt}个`);
    }
}
exports.ReplaceComponent = ReplaceComponent;
