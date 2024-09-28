import { Button, Slider, Toggle, director, js } from "cc";
import { Logger } from "../../tools/Logger";

export class ReplaceComponent {

    public static replace() {
        this.replaceButton();
        this.replaceToggle();
        this.replaceSlider();
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
        Logger.info(`替换Button为MButton完成,共计${btnCnt}个`);
    }

    private static replaceToggle() {
        let toggles = director.getScene().getComponentsInChildren(Toggle);
        let btnCnt = 0;
        toggles.forEach(tog => {
            if (js.getClassName(tog) != "cc.Toggle") return;
            if (tog.getComponent("MToggle")) return;
            btnCnt++;
            let mTog: Toggle = tog.addComponent("MToggle") as Toggle;
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
        Logger.info(`替换Toggle为MToggle完成,共计${btnCnt}个`);
    }


    private static replaceSlider() {
        let sliders = director.getScene().getComponentsInChildren(Slider);
        let cnt = 0;
        sliders.forEach(sld => {
            if (js.getClassName(sld) != "cc.Slider") return;
            if (sld.getComponent("MSlider")) return;
            cnt++;
            let mSlider: Slider = sld.addComponent("MSlider") as Slider;
            mSlider.enabled = sld.enabled;
            mSlider.handle = sld.handle;
            mSlider.direction = sld.direction;
            mSlider.progress = sld.progress;
            mSlider.slideEvents = sld.slideEvents;
            sld.destroy();
        });
        Logger.info(`替换Slider为MSlider完成,共计${cnt}个`);
    }


}