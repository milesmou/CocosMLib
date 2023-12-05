import packageJSON from '../../../package.json';
import { existsSync, readFileSync } from 'fs-extra';
import { createApp, App } from 'vue';
import { join } from 'path';
const axios = require('axios');
const electron = require('electron')
const panelDataMap = new WeakMap<any, App>();

/* i18n */
const translate = (key:string) => Editor.I18n.t(`${packageJSON.name}.${key}`);

/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() {},
        hide() {},
    },
    template: readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {
    },
    ready() {
        if (this.$.app) {
            const app = createApp({
                data() {
                    return {
                        isCustomizing: false,
                        currentTheme: 'Default',
                        themesArray: [
                            {
                                'name': 'Default',
                                'value': ''
                            },
                            {
                                'name': 'Cocos 2.x',
                                'value': '#454545'
                            },
                            {
                                'name': 'Gray',
                                'value': '#c2c2c2'
                            },
                            {
                                'name': 'White',
                                'value': '#ffffff'
                            },
                        ]
                    }
                },
                
                created() {
                    // 检查是否有更新
                    this.checkUpdate()
                },

                mounted() {
                    // 存储编辑器原本的主要颜色
                    let originalCSS = localStorage.getItem('cocos-original-theme')!
                    this.themesArray[0].value = originalCSS.split(';')[0].split(':')[1].trim()
                    
                    // 获取之前设置的主题名称，让插件界面打开时，对应的复选框处于勾选状态
                    this.currentTheme = this.getThemeNameStored()
                },

                methods: {
                    checkUpdate() {
                        // 检查是否有更新
                        axios.get('https://la-vie.gitee.io/cocos-theme/package.json', {headers: {'Cache-Control': 'no-cache'}})
                        .then(function(response: any) {
                            let remoteVersion = response.data.version;
                            if (packageJSON.version != remoteVersion) {
                                console.warn(`[v${remoteVersion}] ${translate('updateWarn')}`);
                            }
                        });
                    },

                    getThemeNameStored() {
                        // 获取之前设置的主题名称，让插件界面打开时，对应的复选框处于勾选状态
                        let themeDataStored = localStorage.getItem('cocos-theme-stored')
                        if (!themeDataStored) {
                            return 'Default'
                        }
                        else {
                            return JSON.parse(themeDataStored).name
                        }
                    },
                    
                    onThemeChanged(themeName: string) {
                        this.currentTheme = themeName
                        
                        // 读取对应的css主题文件
                        let cssFilePath = join(__dirname, `../../../static/style/default/${themeName}.css`)
                        if (!existsSync(cssFilePath)) {
                            Editor.Message.broadcast('cocos-theme:theme-changed', ['Default', ''])
                            return
                        }
                        
                        // 读取主题文件并将主题发送给load-hack.js
                        let themeValue = readFileSync(cssFilePath, 'utf-8')
                        Editor.Message.broadcast('cocos-theme:theme-changed', [themeName, themeValue])
                    },

                    // goToCustomizationPage() {
                    //     Editor.Dialog.info('', {
                    //         buttons: ['OK'],
                    //         title: 'Cocos Theme',
                    //     })
                    //     this.isCustomizing = true
                    // },
                }
            });
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.mount(this.$.app);
            panelDataMap.set(this, app);
        }
    },
    beforeClose() { },
    close() {
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
