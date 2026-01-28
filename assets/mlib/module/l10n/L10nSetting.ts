import { _decorator, Component } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('L10nSetting')
@executeInEditMode
class L10nSetting extends Component {

    @property
    protected _scriptName: string = "L10nSetting";

    
}