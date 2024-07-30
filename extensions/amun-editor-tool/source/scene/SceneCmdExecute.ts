import { ExecuteSceneScriptMethodOptions } from "@cocos/creator-types/editor/packages/scene/@types/public";
import { Logger } from "../tools/Logger";

export class SceneCmdExecute {
    static async autoGenProperty() {
        let nodeUuid = "";
        let type = Editor.Selection.getLastSelectedType();
        if (type == "node") {
            nodeUuid = Editor.Selection.getLastSelected(type);
        }

        const options: ExecuteSceneScriptMethodOptions = {
            name: "amun-scene-tool",
            method: 'autoGenProperty',
            args: [nodeUuid],
        };

        Logger.info("SelectNodeUUID", nodeUuid);
        Editor.Message.request('scene', 'execute-scene-script', options);
    }

    static async replaceComponent() {
        const options: ExecuteSceneScriptMethodOptions = {
            name: "amun-scene-tool",
            method: 'replaceComponent',
            args: [],
        };

        Editor.Message.request('scene', 'execute-scene-script', options);
    }
}