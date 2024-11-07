import { _decorator, CCString, clamp, Component, EventHandler, instantiate, Label, Node, ScrollView, Toggle } from 'cc';
import { MEvent } from 'db://assets/mlib/module/event/MEvent';
const { ccclass, property } = _decorator;

@ccclass('Dropdown')
export class Dropdown extends Component {
    @property({
        displayName: "Interactable"
    })
    m_Interactable = true;

    @property({
        type: Node,
        displayName: "Template"
    })
    private m_Template: Node = null;

    @property({
        type: Label,
        displayName: "CaptionText"
    })
    private m_CaptionText: Label = null;

    @property({
        displayName: "Value"
    })
    private m_Value: number = 0;

    @property({
        type: CCString,
        displayName: "Options"
    })
    private m_Options: string[] = ["Option A", "Option B", "Option C"];


    @property({
        type: EventHandler,
        displayName: "OnValueChange"
    })
    private m_OnValueChange: EventHandler[] = [];

    public readonly OnValueChange = new MEvent<number>()

    public get value() { return this.m_Value; }
    public set value(val: number) { this.modifyValue(val); }

    public get options() { return this.m_Options; }
    public set options(val: string[]) {
        this.m_Options = val;
        this.refresh();
    }

    private _optionContent: Node;

    protected onLoad() {
        this.init();
    }

    private init() {
        this._optionContent = this.m_Template.getComponent(ScrollView).content;
        this.node.on(Node.EventType.TOUCH_END, this.onClickDropdown, this);
        this.loadSelect();
        this.hideTemplate();
    }

    private onClickDropdown() {
        if (this.m_Template.active) {
            this.hideTemplate();
        } else {
            this.showTemplate();
        }
    }

    private refresh() {
        this.hideTemplate();
        this.loadSelect();
        this.loadOptions();
        Component.EventHandler.emitEvents(this.m_OnValueChange, this.m_Value);
        this.OnValueChange.dispatch(this.m_Value);
    }

    private showTemplate() {
        this.loadOptions();
        this.m_Template.active = true;
    }

    private hideTemplate() {
        this.m_Template.active = false;
    }

    private loadSelect() {
        this.m_Value = clamp(this.m_Value, 0, this.m_Options.length - 1);
        if (this.m_Options.length > 0) {
            this.m_CaptionText.string = this.m_Options[this.m_Value];
        } else {
            this.m_CaptionText.string = "None";
        }
    }

    private loadOptions() {
        if (!this._optionContent) {
            console.error("Template Content 不存在!");
            return;
        }
        for (let i = this.m_Options.length; i < this._optionContent.children.length; i++) {
            const option = this._optionContent.children[i];
            option.active = false;
        }

        for (let i = 0; i < this.m_Options.length; i++) {
            let option = this._optionContent.children[i];
            if (!option) {
                option = this.createOption();
            }
            option.active = true;
            let tog = option.getComponent(Toggle);
            let label = option.getComponentInChildren(Label);
            this.addOptionEvent(tog, i);
            tog.isChecked = i == this.m_Value;
            label.string = this.m_Options[i];
        }

    }

    private createOption() {
        let option = instantiate(this._optionContent.children[0]);
        option.parent = this._optionContent;
        option.getComponent(Toggle).clickEvents.length = 1;
        return option;
    }

    private addOptionEvent(tog: Toggle, index: number) {
        if (tog.clickEvents.length > 1) return;
        let evt = new EventHandler();
        evt.target = this.node;
        evt.component = "Dropdown";
        evt.handler = "onClickOption";
        evt.customEventData = index.toString();
        tog.clickEvents.push(evt);
    }

    private onClickOption(tog: Toggle, data: string) {
        let index = parseInt(data);
        this.modifyValue(index);
        this.hideTemplate();
    }

    private modifyValue(val: number) {
        if (val != this.m_Value) {
            this.m_Value = val;
            this.loadSelect();
            this.hideTemplate();
            Component.EventHandler.emitEvents(this.m_OnValueChange, val);
            this.OnValueChange.dispatch(val);
        }
    }

}


