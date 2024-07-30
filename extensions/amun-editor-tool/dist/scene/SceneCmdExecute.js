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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmVDbWRFeGVjdXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3NjZW5lL1NjZW5lQ21kRXhlY3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw0Q0FBeUM7QUFFekMsTUFBYSxlQUFlO0lBQ3hCLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZTtRQUN4QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQ2xELElBQUksSUFBSSxJQUFJLE1BQU0sRUFBRTtZQUNoQixRQUFRLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDckQ7UUFFRCxNQUFNLE9BQU8sR0FBb0M7WUFDN0MsSUFBSSxFQUFFLGlCQUFpQjtZQUN2QixNQUFNLEVBQUUsaUJBQWlCO1lBQ3pCLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQztTQUNuQixDQUFDO1FBRUYsZUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN4QyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCO1FBQ3pCLE1BQU0sT0FBTyxHQUFvQztZQUM3QyxJQUFJLEVBQUUsaUJBQWlCO1lBQ3ZCLE1BQU0sRUFBRSxrQkFBa0I7WUFDMUIsSUFBSSxFQUFFLEVBQUU7U0FDWCxDQUFDO1FBRUYsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3JFLENBQUM7Q0FDSjtBQTNCRCwwQ0EyQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFeGVjdXRlU2NlbmVTY3JpcHRNZXRob2RPcHRpb25zIH0gZnJvbSBcIkBjb2Nvcy9jcmVhdG9yLXR5cGVzL2VkaXRvci9wYWNrYWdlcy9zY2VuZS9AdHlwZXMvcHVibGljXCI7XHJcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gXCIuLi90b29scy9Mb2dnZXJcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBTY2VuZUNtZEV4ZWN1dGUge1xyXG4gICAgc3RhdGljIGFzeW5jIGF1dG9HZW5Qcm9wZXJ0eSgpIHtcclxuICAgICAgICBsZXQgbm9kZVV1aWQgPSBcIlwiO1xyXG4gICAgICAgIGxldCB0eXBlID0gRWRpdG9yLlNlbGVjdGlvbi5nZXRMYXN0U2VsZWN0ZWRUeXBlKCk7XHJcbiAgICAgICAgaWYgKHR5cGUgPT0gXCJub2RlXCIpIHtcclxuICAgICAgICAgICAgbm9kZVV1aWQgPSBFZGl0b3IuU2VsZWN0aW9uLmdldExhc3RTZWxlY3RlZCh0eXBlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IEV4ZWN1dGVTY2VuZVNjcmlwdE1ldGhvZE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IFwiYW11bi1zY2VuZS10b29sXCIsXHJcbiAgICAgICAgICAgIG1ldGhvZDogJ2F1dG9HZW5Qcm9wZXJ0eScsXHJcbiAgICAgICAgICAgIGFyZ3M6IFtub2RlVXVpZF0sXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgTG9nZ2VyLmluZm8oXCJTZWxlY3ROb2RlVVVJRFwiLCBub2RlVXVpZCk7XHJcbiAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnZXhlY3V0ZS1zY2VuZS1zY3JpcHQnLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgcmVwbGFjZUNvbXBvbmVudCgpIHtcclxuICAgICAgICBjb25zdCBvcHRpb25zOiBFeGVjdXRlU2NlbmVTY3JpcHRNZXRob2RPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBuYW1lOiBcImFtdW4tc2NlbmUtdG9vbFwiLFxyXG4gICAgICAgICAgICBtZXRob2Q6ICdyZXBsYWNlQ29tcG9uZW50JyxcclxuICAgICAgICAgICAgYXJnczogW10sXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnZXhlY3V0ZS1zY2VuZS1zY3JpcHQnLCBvcHRpb25zKTtcclxuICAgIH1cclxufSJdfQ==