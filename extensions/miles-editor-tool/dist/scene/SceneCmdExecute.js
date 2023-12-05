"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneCmdExecute = void 0;
const MLogger_1 = require("../tools/MLogger");
class SceneCmdExecute {
    static async autoGenProperty() {
        let nodeUuid = "";
        let type = Editor.Selection.getLastSelectedType();
        if (type == "node") {
            nodeUuid = Editor.Selection.getLastSelected(type);
        }
        const options = {
            name: "miles-scene-tool",
            method: 'autoGenProperty',
            args: [nodeUuid],
        };
        MLogger_1.MLogger.info("SelectNodeUUID", nodeUuid);
        Editor.Message.request('scene', 'execute-scene-script', options);
    }
    static async replaceComponent() {
        const options = {
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
        const options = {
            name: "miles-scene-tool",
            method: 'saveHotUpdateConfig',
            args: [nodeUuid],
        };
        MLogger_1.MLogger.info("SelectNodeUUID", nodeUuid);
        Editor.Message.request('scene', 'execute-scene-script', options);
    }
}
exports.SceneCmdExecute = SceneCmdExecute;
