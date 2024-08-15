import { AssetInfo } from "@cocos/creator-types/editor/packages/asset-db/@types/public";
import { MenuExecute } from "./MenuExecute";


/** 点击资源管理器面板左上角的 + 按钮 资源菜单中的 新建 菜单项被选中时  触发的事件 */
export function onCreateMenu(assetInfo: AssetInfo) {

}

/** 右击资源数据库根节点 assets 时触发的事件 */
export function onDBMenu(assetInfo: AssetInfo) {

}

/** 右击普通资源节点或目录时触发的事件 */
export function onAssetMenu(assetInfo: AssetInfo) {
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
                MenuExecute.copyLoadLocation(assetInfo);
            },
        },
    ];

}



/** 右击资源管理面板空白区域时触发的事件 */
export function onPanelMenu(assetInfo: AssetInfo) {

}
