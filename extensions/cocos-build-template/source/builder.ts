
import { BuildPlugin } from '../@types';

export const load: BuildPlugin.load = function() {
    console.debug('cocos-build-template load');
};

export const unload: BuildPlugin.load = function() {
    console.debug('cocos-build-template unload');
};

const complexTestItems = {
    number: {
        label: 'i18n:cocos-build-template.options.complexTestNumber',
        description: 'i18n:cocos-build-template.options.complexTestNumber',
        default: 80,
        render: {
            ui: 'ui-num-input',
            attributes: {
                step: 1,
                min: 0,
            },
        },
    },
    string: {
        label: 'i18n:cocos-build-template.options.complexTestString',
        description: 'i18n:cocos-build-template.options.complexTestString',
        default: 'cocos',
        render: {
            ui: 'ui-input',
            attributes: {
                placeholder: 'i18n:cocos-build-template.options.enterCocos',
            },
        },
        verifyRules: ['ruleTest'],
    },
    boolean: {
        label: 'i18n:cocos-build-template.options.complexTestBoolean',
        description: 'i18n:cocos-build-template.options.complexTestBoolean',
        default: true,
        render: {
            ui: 'ui-checkbox',
        },
    },
};

export const configs: BuildPlugin.Configs = {
    '*': {
        hooks: './hooks',
        doc: 'editor/publish/custom-build-plugin.html',
        options: {
            remoteAddress: {
                label: 'i18n:cocos-build-template.options.remoteAddress',
                default: 'https://www.cocos.com/',
                render: {
                    ui: 'ui-input',
                    attributes: {
                        placeholder: 'Enter remote address...',
                    },
                },
                verifyRules: ['required'],
            },
            enterCocos: {
                label: 'i18n:cocos-build-template.options.enterCocos',
                description: 'i18n:cocos-build-template.options.enterCocos',
                default: '',
                render: {
                    /**
                     * @en Please refer to Developer -> UI Component for a list of all supported UI components
                     * @zh 请参考 开发者 -> UI 组件 查看所有支持的 UI 组件列表
                     */
                    ui: 'ui-input',
                    attributes: {
                        placeholder: 'i18n:cocos-build-template.options.enterCocos',
                    },
                },
                verifyRules: ['ruleTest'],
                verifyLevel: 'warn',
            },
            selectTest: {
                label: 'i18n:cocos-build-template.options.selectTest',
                description: 'i18n:cocos-build-template.options.selectTest',
                default: 'option2',
                render: {
                    ui: 'ui-select',
                    items: [
                        {
                            label: 'i18n:cocos-build-template.options.selectTestOption1',
                            value: 'option1',
                        },
                        {
                            label: 'i18n:cocos-build-template.options.selectTestOption2',
                            value: 'option2',
                        },
                    ],
                },
            },
            objectTest: {
                label: 'i18n:cocos-build-template.options.objectTest',
                description: 'i18n:cocos-build-template.options.objectTest',
                type: 'object',
                default: {
                    number: complexTestItems.number.default,
                    string: complexTestItems.string.default,
                    boolean: complexTestItems.boolean.default,
                },
                itemConfigs: complexTestItems,
            },
            arrayTest: {
                label: 'i18n:cocos-build-template.options.arrayTest',
                description: 'i18n:cocos-build-template.options.arrayTest',
                type: 'array',
                default: [complexTestItems.number.default, complexTestItems.string.default, complexTestItems.boolean.default],
                itemConfigs: JSON.parse(JSON.stringify(Object.values(complexTestItems))),
            },
        },
        verifyRuleMap: {
            ruleTest: {
                message: 'i18n:cocos-build-template.ruleTest_msg',
                func(val, buildOptions) {
                    if (val === 'cocos') {
                        return true;
                    }
                    return false;
                },
            },
        },
    },
};

export const assetHandlers: BuildPlugin.AssetHandlers = './asset-handlers';
