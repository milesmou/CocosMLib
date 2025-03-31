"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPanelMenu = exports.onAssetMenu = exports.onDBMenu = exports.onCreateMenu = void 0;
const MenuExecute_1 = require("./MenuExecute");
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
        {
            label: '复制加载地址',
            enabled: true,
            click() {
                MenuExecute_1.MenuExecute.copyLoadLocation(assetInfo);
            },
        },
    ];
}
exports.onAssetMenu = onAssetMenu;
/** 右击资源管理面板空白区域时触发的事件 */
function onPanelMenu(assetInfo) {
}
exports.onPanelMenu = onPanelMenu;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXNzZXRNZW51LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL2Fzc2V0bWVudS9Bc3NldE1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsK0NBQTRDO0FBRzVDLGtEQUFrRDtBQUNsRCxTQUFnQixZQUFZLENBQUMsU0FBb0I7QUFFakQsQ0FBQztBQUZELG9DQUVDO0FBRUQsK0JBQStCO0FBQy9CLFNBQWdCLFFBQVEsQ0FBQyxTQUFvQjtBQUU3QyxDQUFDO0FBRkQsNEJBRUM7QUFFRCx3QkFBd0I7QUFDeEIsU0FBZ0IsV0FBVyxDQUFDLFNBQW9CO0lBQzVDLE9BQU87UUFDSDtZQUNJLEtBQUssRUFBRSxVQUFVO1lBQ2pCLE9BQU8sRUFBRTtnQkFDTDtvQkFDSSxLQUFLLEVBQUUsT0FBTztvQkFDZCxPQUFPLEVBQUUsU0FBUyxDQUFDLFdBQVc7b0JBQzlCLEtBQUs7d0JBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDM0IsQ0FBQztpQkFDSjtnQkFDRDtvQkFDSSxLQUFLLEVBQUUsT0FBTztvQkFDZCxPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsV0FBVztvQkFDL0IsS0FBSzt3QkFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7d0JBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzNCLENBQUM7aUJBQ0o7YUFDSjtTQUNKO1FBQ0Q7WUFDSSxLQUFLLEVBQUUsUUFBUTtZQUNmLE9BQU8sRUFBRSxJQUFJO1lBQ2IsS0FBSztnQkFDRCx5QkFBVyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzVDLENBQUM7U0FDSjtLQUNKLENBQUM7QUFFTixDQUFDO0FBaENELGtDQWdDQztBQUlELHlCQUF5QjtBQUN6QixTQUFnQixXQUFXLENBQUMsU0FBb0I7QUFFaEQsQ0FBQztBQUZELGtDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXNzZXRJbmZvIH0gZnJvbSBcIi4uLy4uL0Bjb2Nvcy9jcmVhdG9yLXR5cGVzL2VkaXRvci9wYWNrYWdlcy9hc3NldC1kYi9AdHlwZXMvcHVibGljXCI7XG5pbXBvcnQgeyBNZW51RXhlY3V0ZSB9IGZyb20gXCIuL01lbnVFeGVjdXRlXCI7XG5cblxuLyoqIOeCueWHu+i1hOa6kOeuoeeQhuWZqOmdouadv+W3puS4iuinkueahCArIOaMiemSriDotYTmupDoj5zljZXkuK3nmoQg5paw5bu6IOiPnOWNlemhueiiq+mAieS4reaXtiAg6Kem5Y+R55qE5LqL5Lu2ICovXG5leHBvcnQgZnVuY3Rpb24gb25DcmVhdGVNZW51KGFzc2V0SW5mbzogQXNzZXRJbmZvKSB7XG5cbn1cblxuLyoqIOWPs+WHu+i1hOa6kOaVsOaNruW6k+agueiKgueCuSBhc3NldHMg5pe26Kem5Y+R55qE5LqL5Lu2ICovXG5leHBvcnQgZnVuY3Rpb24gb25EQk1lbnUoYXNzZXRJbmZvOiBBc3NldEluZm8pIHtcblxufVxuXG4vKiog5Y+z5Ye75pmu6YCa6LWE5rqQ6IqC54K55oiW55uu5b2V5pe26Kem5Y+R55qE5LqL5Lu2ICovXG5leHBvcnQgZnVuY3Rpb24gb25Bc3NldE1lbnUoYXNzZXRJbmZvOiBBc3NldEluZm8pIHtcbiAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogJ2hhaGFoYWhhJyxcbiAgICAgICAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnaGFoYTEnLFxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiBhc3NldEluZm8uaXNEaXJlY3RvcnksXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2dldCBpdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYXNzZXRJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdoYWhhMicsXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6ICFhc3NldEluZm8uaXNEaXJlY3RvcnksXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3llcywgeW91IGNsaWNrZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGFzc2V0SW5mbyk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAn5aSN5Yi25Yqg6L295Zyw5Z2AJyxcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICBjbGljaygpIHtcbiAgICAgICAgICAgICAgICBNZW51RXhlY3V0ZS5jb3B5TG9hZExvY2F0aW9uKGFzc2V0SW5mbyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIF07XG5cbn1cblxuXG5cbi8qKiDlj7Plh7votYTmupDnrqHnkIbpnaLmnb/nqbrnmb3ljLrln5/ml7bop6blj5HnmoTkuovku7YgKi9cbmV4cG9ydCBmdW5jdGlvbiBvblBhbmVsTWVudShhc3NldEluZm86IEFzc2V0SW5mbykge1xuXG59XG4iXX0=