"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneTool = void 0;
const cc_1 = require("cc");
class SceneTool {
    /** 获取选中的节点 */
    static getNodeByUUid(uuid) {
        let node = cc_1.director.getScene();
        return this.findNodeInChildren(node, v => v.uuid == uuid);
    }
    /** 在子节点中查找符合要求的节点 */
    static findNodeInChildren(node, predicate) {
        if (node.children.length == 0)
            return null;
        for (const n of node.children) {
            if (predicate(n))
                return n;
            else {
                let nn = this.findNodeInChildren(n, predicate);
                if (nn)
                    return nn;
            }
        }
    }
}
exports.SceneTool = SceneTool;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmVUb29sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc291cmNlL3NjZW5lL3Rvb2wvU2NlbmVUb29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUFvQztBQUVwQyxNQUFhLFNBQVM7SUFFbEIsY0FBYztJQUNQLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBWTtRQUNwQyxJQUFJLElBQUksR0FBRyxhQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDL0IsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQscUJBQXFCO0lBQ2QsTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQVUsRUFBRSxTQUFtQztRQUM1RSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUMzQyxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDM0IsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUFFLE9BQU8sQ0FBQyxDQUFDO2lCQUN0QjtnQkFDRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLEVBQUU7b0JBQUUsT0FBTyxFQUFFLENBQUM7YUFDckI7U0FDSjtJQUNMLENBQUM7Q0FDSjtBQW5CRCw4QkFtQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOb2RlLCBkaXJlY3RvciB9IGZyb20gXCJjY1wiO1xuXG5leHBvcnQgY2xhc3MgU2NlbmVUb29sIHtcblxuICAgIC8qKiDojrflj5bpgInkuK3nmoToioLngrkgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldE5vZGVCeVVVaWQodXVpZDogc3RyaW5nKTogTm9kZSB7XG4gICAgICAgIGxldCBub2RlID0gZGlyZWN0b3IuZ2V0U2NlbmUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluZE5vZGVJbkNoaWxkcmVuKG5vZGUsIHYgPT4gdi51dWlkID09IHV1aWQpO1xuICAgIH1cblxuICAgIC8qKiDlnKjlrZDoioLngrnkuK3mn6Xmib7nrKblkIjopoHmsYLnmoToioLngrkgKi9cbiAgICBwdWJsaWMgc3RhdGljIGZpbmROb2RlSW5DaGlsZHJlbihub2RlOiBOb2RlLCBwcmVkaWNhdGU6IChjaGlsZDogTm9kZSkgPT4gYm9vbGVhbikge1xuICAgICAgICBpZiAobm9kZS5jaGlsZHJlbi5sZW5ndGggPT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgbiBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICBpZiAocHJlZGljYXRlKG4pKSByZXR1cm4gbjtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBubiA9IHRoaXMuZmluZE5vZGVJbkNoaWxkcmVuKG4sIHByZWRpY2F0ZSk7XG4gICAgICAgICAgICAgICAgaWYgKG5uKSByZXR1cm4gbm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59Il19