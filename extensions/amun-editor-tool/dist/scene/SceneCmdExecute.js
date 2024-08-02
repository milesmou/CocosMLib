"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneCmdExecute = void 0;
const ReplaceComponent_1 = require("./replacecomponent/ReplaceComponent");
class SceneCmdExecute {
    static replaceComponent() {
        ReplaceComponent_1.ReplaceComponent.replace();
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
exports.SceneCmdExecute = SceneCmdExecute;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmVDbWRFeGVjdXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3NjZW5lL1NjZW5lQ21kRXhlY3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwRUFBdUU7QUFFdkUsTUFBYSxlQUFlO0lBR2pCLE1BQU0sQ0FBQyxnQkFBZ0I7UUFDMUIsbUNBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDM0IsK0NBQStDO1FBQy9DLGtDQUFrQztRQUNsQyxzREFBc0Q7UUFDdEQscURBQXFEO1FBQ3JELCtCQUErQjtRQUMvQixrQ0FBa0M7UUFDbEMsZ0JBQWdCO1FBQ2hCLEtBQUs7UUFFTCxvRUFBb0U7SUFDeEUsQ0FBQztDQUNKO0FBaEJELDBDQWdCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlcGxhY2VDb21wb25lbnQgfSBmcm9tIFwiLi9yZXBsYWNlY29tcG9uZW50L1JlcGxhY2VDb21wb25lbnRcIjtcblxuZXhwb3J0IGNsYXNzIFNjZW5lQ21kRXhlY3V0ZSB7XG5cblxuICAgIHB1YmxpYyBzdGF0aWMgcmVwbGFjZUNvbXBvbmVudCgpIHtcbiAgICAgICAgUmVwbGFjZUNvbXBvbmVudC5yZXBsYWNlKCk7XG4gICAgICAgIC8vIFNjZW5lQ29ubmVjdC5zZW5kKFwicmVwbGFjZUNvbXBvbmVudFwiLDEsMyw0KTtcbiAgICAgICAgLy8gbGV0IG5vZGUgPSBkaXJlY3Rvci5nZXRTY2VuZSgpO1xuICAgICAgICAvLyBMb2dnZXIuaW5mbyhcIiByZXBsYWNlQ29tcG9uZW50IGhhaGFoaGExXCIsbm9kZS5uYW1lKVxuICAgICAgICAvLyBjb25zdCBvcHRpb25zOiBFeGVjdXRlU2NlbmVTY3JpcHRNZXRob2RPcHRpb25zID0ge1xuICAgICAgICAvLyAgICAgbmFtZTogXCJhbXVuLXNjZW5lLXRvb2xcIixcbiAgICAgICAgLy8gICAgIG1ldGhvZDogJ3JlcGxhY2VDb21wb25lbnQnLFxuICAgICAgICAvLyAgICAgYXJnczogW10sXG4gICAgICAgIC8vIH07XG5cbiAgICAgICAgLy8gRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnZXhlY3V0ZS1zY2VuZS1zY3JpcHQnLCBvcHRpb25zKTtcbiAgICB9XG59Il19