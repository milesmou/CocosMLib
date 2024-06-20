
import { join } from 'path';
import { GenProperty } from './GenProperty';
module.paths.push(join(Editor.App.path, 'node_modules'));

// 临时在当前模块增加编辑器内的模块为搜索路径，为了能够正常 require 到 cc 模块，后续版本将优化调用方式
import { CmdExecute } from './CmdExecute';
import { ReplaceComponent } from './ReplaceComponent';

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    autoGenProperty: GenProperty.gen.bind(GenProperty),
    replaceComponent: ReplaceComponent.replace.bind(ReplaceComponent),
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() { }

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() { }
