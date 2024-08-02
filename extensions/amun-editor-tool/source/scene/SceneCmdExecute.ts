import { ReplaceComponent } from "./replacecomponent/ReplaceComponent";

export class SceneCmdExecute {


    public static replaceComponent() {
        ReplaceComponent.replace();
        // SceneConnect.send("replaceComponent",1,3,4);
        // let node = director.getScene();
        // Logger.info(" replaceComponent hahahha1",node.name)
        // const options: ExecuteSceneScriptMethodOptions = {
        //     name: "amun-scene-tool",
        //     method: 'replaceComponent',
        //     args: [],
        // };

        // Editor.Message.request('scene', 'execute-scene-script', options);
    }
}