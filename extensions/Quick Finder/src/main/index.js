const MainEvent = require('../eazax/main-event');
const EditorMainKit = require('../eazax/editor-main-kit');
const { checkUpdate, reload } = require('../eazax/editor-main-util');
const Updater = require('../eazax/updater');
const ConfigManager = require('../common/config-manager');
const Finder = require('./finder');
const Opener = require('./opener');
const PanelManager = require('./panel-manager');
const { openRepository } = require('../eazax/package-util');

/**
 * 生命周期：加载
 */
function load() {
    // 设置仓库分支
    Updater.branch = 'ccc-v3';
    // 监听事件
    EditorMainKit.register();
    MainEvent.on('match', onMatchEvent);
    MainEvent.on('open', onOpenEvent);
    MainEvent.on('focus', onFocusEvent);
    MainEvent.on('reload', onReloadEvent);
}

/**
 * 生命周期：卸载
 */
function unload() {
    // 关闭搜索栏
    PanelManager.closeSearchBar();
    // 取消事件监听
    EditorMainKit.unregister();
    MainEvent.removeAllListeners('match');
    MainEvent.removeAllListeners('open');
    MainEvent.removeAllListeners('focus');
    MainEvent.removeAllListeners('reload');
}

/**
 * （渲染进程）关键词匹配事件回调
 * @param {Electron.IpcMainEvent} event 
 * @param {string} keyword 关键词
 */
function onMatchEvent(event, keyword) {
    // 匹配结果
    const results = Finder.getMatchedFiles(keyword);
    // 返回结果给渲染进程
    MainEvent.reply(event, 'match-reply', results);
}

/**
 * （渲染进程）打开文件事件回调
 * @param {Electron.IpcMainEvent} event 
 * @param {string} path 路径
 */
function onOpenEvent(event, path) {
    // 打开文件
    Opener.tryOpen(path);
    // 关闭搜索栏
    PanelManager.closeSearchBar();
}

/**
 * （渲染进程）聚焦文件事件回调
 * @param {Electron.IpcMainEvent} event 
 * @param {string} path 路径
 */
async function onFocusEvent(event, path) {
    // 在资源管理器中显示并选中文件
    const uuid = await Opener.fspathToUuid(path);
    Opener.focusOnFile(uuid);
}

/**
 * （渲染进程）重新加载事件回调
 * @param {Electron.IpcMainEvent} event 
 */
function onReloadEvent(event) {
    reload();
}

/**
 * 打开搜索栏
 */
function openSearchBar() {
    const options = {
        /** 打开前 */
        onBeforeOpen: async () => {
            // 收集项目中的文件信息
            await Finder.collectFiles();
            // 发消息通知渲染进程（搜索栏）
            if (PanelManager.search) {
                const webContents = PanelManager.search.webContents;
                MainEvent.send(webContents, 'data-update');
            }
        },
        /** 关闭后 */
        onClosed: () => {
            // 清除缓存
            Finder.clearCaches();
        },
    };
    PanelManager.openSearchBar(options);
}

exports.load = load;

exports.unload = unload;

exports.methods = {

    /**
     * 打开搜索栏
     */
    openSearchBar() {
        openSearchBar();
    },

    /**
     * 打开设置面板
     */
    openSettingsPanel() {
        PanelManager.openSettingsPanel();
    },

    /**
     * 检查更新
     */
    menuCheckUpdate() {
        checkUpdate(true);
    },

    /**
     * 版本号
     */
    menuVersion() {
        openRepository();
    },

    /**
     * 场景编辑器就绪后
     */
    onSceneReady() {
        // 自动检查更新
        const config = ConfigManager.get();
        if (config.autoCheckUpdate) {
            checkUpdate(false);
        }
    },

};
