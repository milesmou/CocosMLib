import { _decorator, Component } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('ConfigBase')
@executeInEditMode
export class ConfigBase extends Component {
    onLoad() {
        console.log(Editor.FSE);

    }

    update(deltaTime: number) {

    }
}


