"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPanelMenu = exports.onAssetMenu = exports.onDBMenu = exports.onCreateMenu = void 0;
/** 点击资源管理器面板左上角的 + 按钮 资源菜单中的 新建 菜单项被选中时  触发的事件 */
function onCreateMenu(assetInfo) {
}
exports.onCreateMenu = onCreateMenu;
/** 右击资源数据库根节点 assets 时触发的事件 */
function onDBMenu(assetInfo) {
}
exports.onDBMenu = onDBMenu;
/** 右击普通资源节点或目录时触发的事件 */
function onAssetMenu(assetInfo) {
    return [
        {
            label: 'hahahaha',
            submenu: [
                {
                    label: 'haha1',
                    enabled: assetInfo.isDirectory,
                    click() {
                        console.log('get it');
                        console.log(assetInfo);
                    },
                },
                {
                    label: 'haha2',
                    enabled: !assetInfo.isDirectory,
                    click() {
                        console.log('yes, you clicked');
                        console.log(assetInfo);
                    },
                },
            ],
        },
    ];
}
exports.onAssetMenu = onAssetMenu;
/** 右击资源管理面板空白区域时触发的事件 */
function onPanelMenu(assetInfo) {
}
exports.onPanelMenu = onPanelMenu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXNzZXRNZW51LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc291cmNlL0Fzc2V0TWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSxrREFBa0Q7QUFDbEQsU0FBZ0IsWUFBWSxDQUFDLFNBQW9CO0FBRWpELENBQUM7QUFGRCxvQ0FFQztBQUVELCtCQUErQjtBQUMvQixTQUFnQixRQUFRLENBQUMsU0FBb0I7QUFFN0MsQ0FBQztBQUZELDRCQUVDO0FBRUQsd0JBQXdCO0FBQ3hCLFNBQWdCLFdBQVcsQ0FBQyxTQUFvQjtJQUM1QyxPQUFPO1FBQ0g7WUFDSSxLQUFLLEVBQUUsVUFBVTtZQUNqQixPQUFPLEVBQUU7Z0JBQ0w7b0JBQ0ksS0FBSyxFQUFFLE9BQU87b0JBQ2QsT0FBTyxFQUFFLFNBQVMsQ0FBQyxXQUFXO29CQUM5QixLQUFLO3dCQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzNCLENBQUM7aUJBQ0o7Z0JBQ0Q7b0JBQ0ksS0FBSyxFQUFFLE9BQU87b0JBQ2QsT0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDLFdBQVc7b0JBQy9CLEtBQUs7d0JBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO3dCQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUMzQixDQUFDO2lCQUNKO2FBQ0o7U0FDSjtLQUNKLENBQUM7QUFFTixDQUFDO0FBekJELGtDQXlCQztBQUlELHlCQUF5QjtBQUN6QixTQUFnQixXQUFXLENBQUMsU0FBb0I7QUFFaEQsQ0FBQztBQUZELGtDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXNzZXRJbmZvIH0gZnJvbSBcIkBjb2Nvcy9jcmVhdG9yLXR5cGVzL2VkaXRvci9wYWNrYWdlcy9hc3NldC1kYi9AdHlwZXMvcHVibGljXCI7XHJcblxyXG5cclxuLyoqIOeCueWHu+i1hOa6kOeuoeeQhuWZqOmdouadv+W3puS4iuinkueahCArIOaMiemSriDotYTmupDoj5zljZXkuK3nmoQg5paw5bu6IOiPnOWNlemhueiiq+mAieS4reaXtiAg6Kem5Y+R55qE5LqL5Lu2ICovXHJcbmV4cG9ydCBmdW5jdGlvbiBvbkNyZWF0ZU1lbnUoYXNzZXRJbmZvOiBBc3NldEluZm8pIHtcclxuXHJcbn1cclxuXHJcbi8qKiDlj7Plh7votYTmupDmlbDmja7lupPmoLnoioLngrkgYXNzZXRzIOaXtuinpuWPkeeahOS6i+S7tiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gb25EQk1lbnUoYXNzZXRJbmZvOiBBc3NldEluZm8pIHtcclxuXHJcbn1cclxuXHJcbi8qKiDlj7Plh7vmma7pgJrotYTmupDoioLngrnmiJbnm67lvZXml7bop6blj5HnmoTkuovku7YgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG9uQXNzZXRNZW51KGFzc2V0SW5mbzogQXNzZXRJbmZvKSB7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGFiZWw6ICdoYWhhaGFoYScsXHJcbiAgICAgICAgICAgIHN1Ym1lbnU6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ2hhaGExJyxcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiBhc3NldEluZm8uaXNEaXJlY3RvcnksXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2soKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnZXQgaXQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYXNzZXRJbmZvKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ2hhaGEyJyxcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiAhYXNzZXRJbmZvLmlzRGlyZWN0b3J5LFxyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygneWVzLCB5b3UgY2xpY2tlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhc3NldEluZm8pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgIH0sXHJcbiAgICBdO1xyXG5cclxufVxyXG5cclxuXHJcblxyXG4vKiog5Y+z5Ye76LWE5rqQ566h55CG6Z2i5p2/56m655m95Yy65Z+f5pe26Kem5Y+R55qE5LqL5Lu2ICovXHJcbmV4cG9ydCBmdW5jdGlvbiBvblBhbmVsTWVudShhc3NldEluZm86IEFzc2V0SW5mbykge1xyXG5cclxufVxyXG4iXX0=