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
