/// <reference path='../../../@types/index'/>
export * from '@cocos/creator-types/editor/packages/builder/@types/protected';

import { IInternalBuildOptions, InternalBuildResult } from '@cocos/creator-types/editor/packages/builder/@types/protected';

export type IOrientation = 'landscape' | 'portrait';

export interface ITaskOption extends IInternalBuildOptions {
    packages: {
        'openharmony': IOptions;
    }
}

export type IAppABI = 'armeabi-v7a' | 'arm64-v8a';

export interface IOptions {
    packageName: string;
    orientation: {
        landscapeRight: boolean;
        landscapeLeft: boolean;
        portrait: boolean;
        upsideDown: boolean;
    },

    apiLevel: number;
    sdkPath: string;
    ndkPath: string;
    appABIs: IAppABI[];

    renderBackEnd: {
        // vulkan: boolean;
        gles3: boolean;
        // gles2: boolean;
    };
    useAotOptimization: boolean;
    useV8: boolean;
}

export interface IBuildResult extends InternalBuildResult {
    userFrameWorks: boolean; // 是否使用用户的配置数据
}
