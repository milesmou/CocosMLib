import { ExecuteSceneScriptMethodOptions } from "../../@types/packages/scene/@types/public";
import { MLogger } from "../tools/MLogger";

export class SceneCmdExecute{
    static async autoGenProperty() {
        let nodeUuid = "";
        let type = Editor.Selection.getLastSelectedType();
        if (type == "node") {
            nodeUuid = Editor.Selection.getLastSelected(type);
        }

        const options: ExecuteSceneScriptMethodOptions = {
            name: "miles-scene-tool",
            method: 'autoGenProperty',
            args: [nodeUuid],
        };

        MLogger.info("SelectNodeUUID", nodeUuid);
        Editor.Message.request('scene', 'execute-scene-script', options);
    }

    static async replaceComponent() {
        const options: ExecuteSceneScriptMethodOptions = {
            name: "miles-scene-tool",
            method: 'replaceComponent',
            args: [],
        };

        Editor.Message.request('scene', 'execute-scene-script', options);
    }

    static saveHotUpdateConfig() {
        let nodeUuid = "";
        let type = Editor.Selection.getLastSelectedType();
        if (type == "node") {
            nodeUuid = Editor.Selection.getLastSelected(type);
        }

        const options: ExecuteSceneScriptMethodOptions = {
            name: "miles-scene-tool",
            method: 'saveHotUpdateConfig',
            args: [nodeUuid],
        };

        MLogger.info("SelectNodeUUID", nodeUuid);
        Editor.Message.request('scene', 'execute-scene-script', options);
    }
}