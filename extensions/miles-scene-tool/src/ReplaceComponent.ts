import { Button, Toggle, director, js } from "cc";
import { MLogger } from "./tools/MLogger";

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
        toggles.forEach(v => {
            if (js.getClassName(v) != "cc.Toggle") return;
            if (v.getComponent("MToggle")) return;
            btnCnt++;
            let mTog: Toggle = v.node.addComponent("MToggle") as Toggle;
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
        MLogger.info(`替换Toggle为MToggle完成,共计${btnCnt}个`);
    }

}