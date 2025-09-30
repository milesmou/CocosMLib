const Path = require('path');
const ConfigManager = require('../common/config-manager');

/**
 * 文件打开器
 */
const Opener = {

    /**
     * 尝试打开文件
     * @param {string} path 路径
     */
    async tryOpen(path) {
        const extname = Path.extname(path),
            uuid = await Opener.fspathToUuid(path);
        // 是否配置了快速打开
        const { openable } = ConfigManager.cache;
        if (openable.indexOf(extname) !== -1) {
            Opener.open(uuid);
        }
        // 聚焦到文件
        Opener.focusOnFile(uuid);
    },

    /**
     * 打开文件
     * @param {string} uuid Uuid
     */
    open(uuid) {
        Editor.Message.send('asset-db', 'open-asset', uuid);
    },

    /**
     * 聚焦到文件（在资源管理器中显示并选中文件）
     * @param {string} uuid Uuid
     */
    focusOnFile(uuid) {
        Editor.Selection.clear('asset');
        Editor.Selection.select('asset', [uuid]);
    },

    /**
     * 通过绝对路径获取 uuid
     * @param {string} path 路径
     * @returns {Promise<string>}
     */
    fspathToUuid(path) {
        return Editor.Message.request('asset-db', 'query-uuid', path);
    },

};

module.exports = Opener;
