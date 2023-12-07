import { Button, Toggle, director, js } from "cc";
import { MLogger } from "./tools/MLogger";
import { Component } from "cc";

export class ReplaceComponent {

    static replace() {
        this.replaceButton();
        this.replaceToggle();
    }

    private static replaceButton() {
        let buttons = director.getScene().getComponentsInChildren(Button);
        let btnCnt = 0;
        buttons.forEach(v => {
            if (js.getClassName(v) != "cc.Button") return;
            if (v.getComponent("MButton")) return;
            btnCnt++;
            let mBtn: Button = v.node.addComponent("MButton") as Button;
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
        MLogger.info(`替换Button为MButton完成,共计${btnCnt}个`);
    }

    private static replaceToggle() {
        let toggles = director.getScene().getComponentsInChildren(Toggle);
        let btnCnt = 0;
        toggles.forEach(tog => {
            if (js.getClassName(tog) != "cc.Toggle") return;
            if (tog.getComponent("MToggle")) return;
            btnCnt++;
            let mTog: Toggle = tog.node.addComponent("MToggle") as Toggle;
            mTog.enabled = tog.enabled;
            mTog.target = tog.target;
            mTog.isChecked = tog.isChecked;
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
            tog.destroy();
        });
        MLogger.info(`替换Toggle为MToggle完成,共计${btnCnt}个`);
    }

}