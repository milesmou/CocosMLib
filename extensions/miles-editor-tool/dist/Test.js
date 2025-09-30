"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
/** 获取指定目录下所有目录 */
function getAllDirs(dir, filter, topDirOnly = false) {
    let dirs = [];
    if (!fs_extra_1.default.existsSync(dir))
        return dirs;
    let walkSync = (currentDir, callback) => {
        fs_extra_1.default.readdirSync(currentDir, { withFileTypes: true }).forEach(dirent => {
            let p = path_1.default.join(currentDir, dirent.name);
            if (dirent.isDirectory()) {
                callback(p);
                if (topDirOnly)
                    return;
                walkSync(p, callback);
            }
        });
    };
    walkSync(dir, subDir => {
        if (!filter || filter(subDir)) {
            dirs.push(subDir);
        }
    });
    return dirs;
}
let dir = "E:/Workspace/NewCooking/program/trunk/NewCooking/assets/bundles";
let dirs = getAllDirs(dir, null);
for (const d of dirs) {
    console.log(d);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NvdXJjZS9UZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsd0RBQTBCO0FBQzFCLGdEQUF3QjtBQUl4QixrQkFBa0I7QUFDbEIsU0FBUyxVQUFVLENBQUMsR0FBVyxFQUFFLE1BQWlDLEVBQUUsVUFBVSxHQUFHLEtBQUs7SUFDbEYsSUFBSSxJQUFJLEdBQWEsRUFBRSxDQUFDO0lBQ3hCLElBQUksQ0FBQyxrQkFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUM7UUFBRSxPQUFPLElBQUksQ0FBQztJQUNyQyxJQUFJLFFBQVEsR0FBRyxDQUFDLFVBQWtCLEVBQUUsUUFBb0MsRUFBRSxFQUFFO1FBQ3hFLGtCQUFFLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNqRSxJQUFJLENBQUMsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0MsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQ3RCLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWixJQUFJLFVBQVU7b0JBQUUsT0FBTztnQkFDdkIsUUFBUSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUN6QjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO0lBQ0YsUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFBRTtRQUNuQixJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3JCO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBQ0QsSUFBSSxHQUFHLEdBQUcsaUVBQWlFLENBQUM7QUFFNUUsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRTtJQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBRWxCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gXCJmcy1leHRyYVwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuXG5cbi8qKiDojrflj5bmjIflrprnm67lvZXkuIvmiYDmnInnm67lvZUgKi9cbmZ1bmN0aW9uIGdldEFsbERpcnMoZGlyOiBzdHJpbmcsIGZpbHRlcj86IChkaXI6IHN0cmluZykgPT4gYm9vbGVhbiwgdG9wRGlyT25seSA9IGZhbHNlKSB7XG4gICAgbGV0IGRpcnM6IHN0cmluZ1tdID0gW107XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGRpcikpIHJldHVybiBkaXJzO1xuICAgIGxldCB3YWxrU3luYyA9IChjdXJyZW50RGlyOiBzdHJpbmcsIGNhbGxiYWNrOiAoZmlsZVBhdGg6IHN0cmluZykgPT4gdm9pZCkgPT4ge1xuICAgICAgICBmcy5yZWFkZGlyU3luYyhjdXJyZW50RGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSkuZm9yRWFjaChkaXJlbnQgPT4ge1xuICAgICAgICAgICAgbGV0IHAgPSBwYXRoLmpvaW4oY3VycmVudERpciwgZGlyZW50Lm5hbWUpO1xuICAgICAgICAgICAgaWYgKGRpcmVudC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2socCk7XG4gICAgICAgICAgICAgICAgaWYgKHRvcERpck9ubHkpIHJldHVybjtcbiAgICAgICAgICAgICAgICB3YWxrU3luYyhwLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgd2Fsa1N5bmMoZGlyLCBzdWJEaXIgPT4ge1xuICAgICAgICBpZiAoIWZpbHRlciB8fCBmaWx0ZXIoc3ViRGlyKSkge1xuICAgICAgICAgICAgZGlycy5wdXNoKHN1YkRpcik7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGlycztcbn1cbmxldCBkaXIgPSBcIkU6L1dvcmtzcGFjZS9OZXdDb29raW5nL3Byb2dyYW0vdHJ1bmsvTmV3Q29va2luZy9hc3NldHMvYnVuZGxlc1wiO1xuXG5sZXQgZGlycyA9IGdldEFsbERpcnMoZGlyLG51bGwpO1xuZm9yIChjb25zdCBkIG9mIGRpcnMpIHtcbiAgICBjb25zb2xlLmxvZyhkKTtcbiAgICBcbn0iXX0=