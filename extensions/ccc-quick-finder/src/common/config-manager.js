const Path = require('path');
const Fs = require('fs');

/** 配置文件路径 */
const CONFIG_PATH = Path.join(__dirname, '../../config.json');

/** package.json 的路径 */
const PACKAGE_PATH = Path.join(__dirname, '../../package.json');

/**
 * 配置缓存
 */
let configCache = null;

/**
 * 配置管理器
 */
const ConfigManager = {

    /**
     * 配置缓存
     */
    get cache() {
        if (!configCache) {
            ConfigManager.get();
        }
        return configCache;
    },

    /**
     * 默认配置
     */
    get defaultConfig() {
        return {
            version: '1.1',
            openable: ['.scene', '.prefab'],
            autoCheckUpdate: true,
        };
    },

    /**
     * 读取配置
     */
    get() {
        const config = ConfigManager.defaultConfig;
        // 配置
        if (Fs.existsSync(CONFIG_PATH)) {
            const localConfig = JSON.parse(Fs.readFileSync(CONFIG_PATH));
            for (const key in config) {
                if (localConfig[key] !== undefined) {
                    config[key] = localConfig[key];
                }
            }
        }
        // 缓存起来
        configCache = JSON.parse(JSON.stringify(config));

        // 快捷键
        config.hotkey = ConfigManager.getAccelerator();

        // Done
        return config;
    },

    /**
     * 保存配置
     * @param {*} value 配置
     */
    set(value) {
        const config = ConfigManager.defaultConfig;
        // 配置
        for (const key in config) {
            if (value[key] !== undefined) {
                config[key] = value[key];
            }
        }
        Fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        // 缓存起来
        configCache = JSON.parse(JSON.stringify(config));

        // 快捷键
        ConfigManager.setAccelerator(value.hotkey);
    },

    /**
     * 获取快捷键
     * @returns {string}
     */
    getAccelerator() {
        const package = JSON.parse(Fs.readFileSync(PACKAGE_PATH)),
            item = package['contributions']['shortcuts'][0];
        return item['win'] || '';
    },

    /**
     * 设置快捷键
     * @param {string} value 
     */
    setAccelerator(value) {
        const package = JSON.parse(Fs.readFileSync(PACKAGE_PATH)),
            item = package['contributions']['shortcuts'][0];
        if (value != undefined && value !== '') {
            item['win'] = value;
            item['mac'] = value;
        } else {
            item['win'] = '';
            item['mac'] = '';
        }
        Fs.writeFileSync(PACKAGE_PATH, JSON.stringify(package, null, 2));
    },

};

module.exports = ConfigManager;
