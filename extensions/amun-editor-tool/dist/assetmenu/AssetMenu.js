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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXNzZXRNZW51LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL2Fzc2V0bWVudS9Bc3NldE1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0Esa0RBQWtEO0FBQ2xELFNBQWdCLFlBQVksQ0FBQyxTQUFvQjtBQUVqRCxDQUFDO0FBRkQsb0NBRUM7QUFFRCwrQkFBK0I7QUFDL0IsU0FBZ0IsUUFBUSxDQUFDLFNBQW9CO0FBRTdDLENBQUM7QUFGRCw0QkFFQztBQUVELHdCQUF3QjtBQUN4QixTQUFnQixXQUFXLENBQUMsU0FBb0I7SUFDNUMsT0FBTztRQUNIO1lBQ0ksS0FBSyxFQUFFLFVBQVU7WUFDakIsT0FBTyxFQUFFO2dCQUNMO29CQUNJLEtBQUssRUFBRSxPQUFPO29CQUNkLE9BQU8sRUFBRSxTQUFTLENBQUMsV0FBVztvQkFDOUIsS0FBSzt3QkFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUMzQixDQUFDO2lCQUNKO2dCQUNEO29CQUNJLEtBQUssRUFBRSxPQUFPO29CQUNkLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQyxXQUFXO29CQUMvQixLQUFLO3dCQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQzt3QkFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDM0IsQ0FBQztpQkFDSjthQUNKO1NBQ0o7S0FDSixDQUFDO0FBRU4sQ0FBQztBQXpCRCxrQ0F5QkM7QUFJRCx5QkFBeUI7QUFDekIsU0FBZ0IsV0FBVyxDQUFDLFNBQW9CO0FBRWhELENBQUM7QUFGRCxrQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0SW5mbyB9IGZyb20gXCJAY29jb3MvY3JlYXRvci10eXBlcy9lZGl0b3IvcGFja2FnZXMvYXNzZXQtZGIvQHR5cGVzL3B1YmxpY1wiO1xuXG5cbi8qKiDngrnlh7votYTmupDnrqHnkIblmajpnaLmnb/lt6bkuIrop5LnmoQgKyDmjInpkq4g6LWE5rqQ6I+c5Y2V5Lit55qEIOaWsOW7uiDoj5zljZXpobnooqvpgInkuK3ml7YgIOinpuWPkeeahOS6i+S7tiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9uQ3JlYXRlTWVudShhc3NldEluZm86IEFzc2V0SW5mbykge1xuXG59XG5cbi8qKiDlj7Plh7votYTmupDmlbDmja7lupPmoLnoioLngrkgYXNzZXRzIOaXtuinpuWPkeeahOS6i+S7tiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9uREJNZW51KGFzc2V0SW5mbzogQXNzZXRJbmZvKSB7XG5cbn1cblxuLyoqIOWPs+WHu+aZrumAmui1hOa6kOiKgueCueaIluebruW9leaXtuinpuWPkeeahOS6i+S7tiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9uQXNzZXRNZW51KGFzc2V0SW5mbzogQXNzZXRJbmZvKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdoYWhhaGFoYScsXG4gICAgICAgICAgICBzdWJtZW51OiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ2hhaGExJyxcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogYXNzZXRJbmZvLmlzRGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICBjbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnZXQgaXQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGFzc2V0SW5mbyk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnaGFoYTInLFxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiAhYXNzZXRJbmZvLmlzRGlyZWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICBjbGljaygpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd5ZXMsIHlvdSBjbGlja2VkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhc3NldEluZm8pO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIF07XG5cbn1cblxuXG5cbi8qKiDlj7Plh7votYTmupDnrqHnkIbpnaLmnb/nqbrnmb3ljLrln5/ml7bop6blj5HnmoTkuovku7YgKi9cbmV4cG9ydCBmdW5jdGlvbiBvblBhbmVsTWVudShhc3NldEluZm86IEFzc2V0SW5mbykge1xuXG59XG4iXX0=