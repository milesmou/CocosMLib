const Path = require('path');
const { map } = require('../eazax/file-util');

/**
 * 查找器
 */
const Finder = {

    /**
     * 数据缓存
     * @type {{ name: string, path: string, extname: string }[]}
     */
    caches: null,

    /**
     * 清除缓存
     */
    clearCaches() {
        Finder.caches = null;
    },

    /**
     * 收集项目中的文件信息
     */
    async collectFiles() {
        const caches = Finder.caches = [];
        // 文件处理函数
        const handler = (path, stat) => {
            // 过滤
            if (Finder.filter(path)) {
                const name = Path.basename(path),
                    extname = Path.extname(path);
                caches.push({ name, path, extname });
            }
        }
        // 遍历项目文件
        const assetsPath = Path.join(Editor.Project.path, 'assets');
        await map(assetsPath, handler);
    },

    /**
     * 过滤文件
     * @param {string} path 路径
     * @returns {boolean}
     */
    filter(path) {
        // 扩展名
        const extname = Path.extname(path);
        // 排除 meta 文件和没有扩展名的文件
        if (extname === '.meta' || extname === '') {
            return false;
        }
        // 可用
        return true;
    },

    /**
     * 获取项目中匹配关键词的文件
     * @param {string} keyword 关键词
     * @returns {{ name: string, path: string, extname: string, similarity: number }[]}
     */
    getMatchedFiles(keyword) {
        // 处理正则公式符号
        const components = keyword.split('');
        for (let i = 0, l = components.length; i < l; i++) {
            if (/[*.?+$^()\[\]{}|\\\/]/.test(components[i])) {
                components[i] = '\\' + components[i];
            }
        }
        // 正则匹配
        // - (.*)：每个关键字之间可以有任意个字符；
        // - (?)：懒惰模式，匹配尽可能少的字符；
        // - (i)：不区分大小写；
        const pattern = components.join('.*?'),
            regExp = new RegExp(pattern, 'i');
        // 下面这行正则插入很炫酷，但是性能不好，耗时接近 split + join 的 10 倍
        // const pattern = keyword.replace(/(?<=.)(.)/g, '.*$1');
        // 查找并匹配
        const caches = Finder.caches,
            results = [];
        if (caches) {
            // 从缓存中查找
            for (let i = 0, l = caches.length; i < l; i++) {
                const { name, path, extname } = caches[i];
                // 匹配
                const match = name.match(regExp);
                if (match) {
                    // 相似度
                    const similarity = match[0].length;
                    results.push({ name, path, extname, similarity });
                }
            }
            // 排序（similarity 越小，匹配的长度越短，匹配度越高）
            results.sort((a, b) => a.similarity - b.similarity);
        }
        return results;
    },

};

module.exports = Finder;
