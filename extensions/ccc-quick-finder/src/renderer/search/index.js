const { sep } = require('path');
const { getUrlParam } = require('../../eazax/browser-util');
const { translate } = require('../../eazax/i18n');
const RendererEvent = require('../../eazax/renderer-event');

// 导入 Vue 工具函数
const { ref, onMounted, onBeforeUnmount, nextTick, createApp } = Vue;

/** 当前语言 */
const LANG = getUrlParam('lang');

// 构建 Vue 应用
const App = {

    /**
     * 设置
     * @param {*} props 
     * @param {*} context 
     */
    setup(props, context) {

        // 分帧加载定时器
        let loadHandler = null;

        // 输入框元素
        const input = ref(null);

        // 输入的关键字
        const keyword = ref('');
        // 关键词匹配返回的结果
        const items = ref([]);
        // 当前选中的项目下标
        const curIndex = ref(-1);

        /**
         * 更新当前的选择
         */
        function updateSelected() {
            // 更新输入框的文本
            keyword.value = items.value[curIndex.value].name;
            // 只有当目标元素不在可视区域内才滚动
            nextTick(() => {
                const id = `item-${curIndex.value}`;
                document.getElementById(id).scrollIntoViewIfNeeded(false);
            });
        }

        /**
         * 输入框更新回调
         * @param {*} event 
         */
        function onInputChange(event) {
            // 取消分帧加载
            if (loadHandler) {
                clearTimeout(loadHandler);
                loadHandler = null;
            }
            // 取消当前选中
            curIndex.value = -1;
            // 关键字为空时不进行搜索
            if (keyword.value === '') {
                items.value.length = 0;
                return;
            }
            // 发消息给主进程进行关键词匹配
            RendererEvent.send('match', keyword.value);
        }

        /**
         * 确认按钮点击回调
         * @param {*} event 
         */
        function onEnterBtnClick(event) {
            if (curIndex.value === -1) {
                if (keyword.value !== '') {
                    // 输入框文本错误动画
                    const inputClasses = input.value.classList;
                    inputClasses.add('input-error');
                    setTimeout(() => {
                        inputClasses.remove('input-error');
                    }, 500);
                }
            } else {
                const item = items.value[curIndex.value];
                // 更新输入框文本
                keyword.value = item.name;
                // 发消息给主进程
                RendererEvent.send('open', item.path);
            }
            // 聚焦到输入框（此时焦点在按钮或列表上）
            focusOnInputField();
        }

        /**
         * 上箭头按键回调
         * @param {*} event 
         */
        function onUpBtnClick(event) {
            // 阻止默认事件（光标移动）
            event.preventDefault();
            // 循环选择
            if (curIndex.value > 0) {
                curIndex.value--;
            } else {
                curIndex.value = items.value.length - 1;
            }
            // 更新选择
            updateSelected();
        }

        /**
         * 下箭头按键回调
         * @param {*} event 
         */
        function onDownBtnClick(event) {
            // 阻止默认事件（光标移动）
            event.preventDefault();
            // 循环选择
            if (curIndex.value >= items.value.length - 1) {
                curIndex.value = 0;
            } else {
                curIndex.value++;
            }
            // 更新选择
            updateSelected();
        }

        /**
         * 左箭头按键回调
         * @param {*} event 
         */
        function onLeftBtnClick(event) {
            // 是否已选中项目
            if (curIndex.value === -1) {
                return;
            }
            // 阻止默认事件（光标移动）
            event.preventDefault();
            // 在资源管理器中显示并选中文件
            focusOnFileInAssets();
        }

        /**
         * 右箭头按键回调
         * @param {*} event 
         */
        function onRightBtnClick(event) {
            // 是否已选中项目
            if (curIndex.value === -1) {
                return;
            }
            // 阻止默认事件（光标移动）
            event.preventDefault();
            // 在资源管理器中显示并选中文件
            focusOnFileInAssets();
        }

        /**
         * 在资源管理器中显示并选中文件
         */
        function focusOnFileInAssets() {
            // 当前选中项目
            const item = items.value[curIndex.value];
            // 发消息给主进程
            RendererEvent.send('focus', item.path);
        }

        /**
         * 结果点击回调
         * @param {{ name: string, path: string, extname: string }} item 数据
         * @param {number} index 下标
         */
        function onItemClick(item, index) {
            curIndex.value = parseInt(index);
            keyword.value = item.name;
            // 添加组件
            onEnterBtnClick(null);
            // 聚焦到输入框（此时焦点在列表上）
            // 换成在 onEnterBtnClick 里统一处理了
            // focusOnInputField();
        }

        /**
         * 聚焦到输入框
         */
        function focusOnInputField() {
            input.value.focus();
        }

        /**
         * （主进程）数据更新回调
         * @param {Electron.IpcRendererEvent} event 
         */
        function onDataUpdate(event) {
            // console.log('onDataUpdate');
            // 触发文件搜索
            onInputChange(null);
        }

        /**
         * （主进程）匹配关键词回调
         * @param {Electron.IpcRendererEvent} event 
         * @param {{ name: string, path: string, extname: string }[]} results 结果
         */
        function onMatchReply(event, results) {
            // console.log('onMatchReply', results);
            // 清除已有数据
            items.value.length = 0;
            // 当只有一个结果时直接选中
            if (results.length === 1) {
                items.value = results;
                curIndex.value = 0;
                return;
            }
            // 结果数量多时分段加载
            if (results.length >= 200) {
                // 每次加载的数量
                const threshold = 400;
                // 分段加载函数
                const load = () => {
                    const length = results.length,
                        count = length >= threshold ? threshold : length,
                        part = results.splice(0, count);
                    // 加载一部分
                    for (let i = 0, l = part.length; i < l; i++) {
                        items.value.push(part[i]);
                    }
                    // 是否还有数据
                    if (results.length > 0) {
                        // 下一波继续
                        loadHandler = setTimeout(load);
                    } else {
                        // Done
                        loadHandler = null;
                    }
                }
                // 开始加载
                load();
            } else {
                // 数量不多，更新结果列表
                items.value = results;
            }
        }

        /**
         * 获取图标
         * @param {string} extname 扩展名
         * @returns {string}
         */
        function getIcon(extname) {
            const iconName = ICON_MAP[extname] || 'asset';
            return `../../../images/assets/${iconName}.png`;
        }

        /**
         * 处理路径
         * @param {string} path 完成路径
         * @returns {string}
         */
        function getPath(path) {
            const start = path.indexOf(`${sep}assets`);
            return path.slice(start + 1);
        }

        /**
         * 翻译
         * @param {string} key 
         */
        function t(key) {
            return translate(LANG, key);
        }

        /**
         * 生命周期：挂载后
         */
        onMounted(() => {
            // 监听事件
            RendererEvent.on('data-update', onDataUpdate);
            RendererEvent.on('match-reply', onMatchReply);
            // 下一帧
            nextTick(() => {
                // 聚焦到输入框
                focusOnInputField();
            });
        });

        /**
         * 生命周期：卸载前
         */
        onBeforeUnmount(() => {
            // 取消事件监听
            RendererEvent.removeAllListeners('data-update');
            RendererEvent.removeAllListeners('match-reply');
        });

        return {
            input,
            keyword,
            items,
            curIndex,
            onInputChange,
            onEnterBtnClick,
            onUpBtnClick,
            onDownBtnClick,
            onLeftBtnClick,
            onRightBtnClick,
            onItemClick,
            getIcon,
            getPath,
            t,
        };

    },

};

// 创建实例
const app = createApp(App);
// 挂载
app.mount('#app');

/** 文件扩展名对应图标表 */
const ICON_MAP = {
    '.anim': 'animation-clip',
    '.prefab': 'prefab',
    '.fire': 'scene',
    '.scene': 'scene',
    '.effect': 'shader',
    '.mesh': 'mesh',
    '.FBX': 'mesh',
    '.mtl': 'material',
    '.pmtl': 'physics-material',
    '.pac': 'auto-atlas',
    '.ts': 'typescript',
    '.js': 'javascript',
    '.coffee': 'coffeescript',
    '.json': 'json',
    '.md': 'markdown',
    '.html': 'html',
    '.css': 'css',
    '.txt': 'text',
    '.ttf': 'ttf-font',
    '.fnt': 'bitmap-font',
    '.mp3': 'audio-clip',
    '.png': 'atlas',
    '.jpg': 'atlas',
    '.plist': 'sprite-atlas',
};
