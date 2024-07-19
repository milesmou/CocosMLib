"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneCmdExecute = void 0;
const Logger_1 = require("../tools/Logger");
class SceneCmdExecute {
    static async autoGenProperty() {
        let nodeUuid = "";
        let type = Editor.Selection.getLastSelectedType();
        if (type == "node") {
            nodeUuid = Editor.Selection.getLastSelected(type);
        }
        const options = {
            name: "amun-scene-tool",
            method: 'autoGenProperty',
            args: [nodeUuid],
        };
        Logger_1.Logger.info("SelectNodeUUID", nodeUuid);
        Editor.Message.request('scene', 'execute-scene-script', options);
    }
    static async replaceComponent() {
        const options = {
            name: "amun-scene-tool",
            method: 'replaceComponent',
            args: [],
        };
        Editor.Message.request('scene', 'execute-scene-script', options);
    }
}
exports.SceneCmdExecute = SceneCmdExecute;
