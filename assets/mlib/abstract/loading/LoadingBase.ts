import { _decorator } from 'cc';
import { UIComponent } from '../../../mlib/module/ui/manager/UIComponent';
const { ccclass, property } = _decorator;


/** 加载界面模块基类 */
export abstract class LoadingBase extends UIComponent {


    protected start(): void {
        this.startGame();
    }

    /** 开始游戏 */
    protected async startGame() {

    }

    /** 加载配置 */
    protected loadCfg(retryCount: number = 3): Promise<void> {
        return Promise.resolve();
    }

    /** 检查游戏版本 */
    protected checkVersion(): Promise<void> {
        return Promise.resolve();
    }

    /** 登录 */
    protected login(retryCount: number = 3): Promise<void> {
        return Promise.resolve();
    }

    /** 加载启动时必要的资源包 */
    protected loadBundle(): Promise<void> {
        return Promise.resolve();
    }

    /** 加载Wasm模块 */
    protected loadWasmModule(): Promise<void> {
        return Promise.resolve();
    }

    /** 同步游戏数据 */
    protected syncGameData(retryCount: number = 3): Promise<void> {
        return Promise.resolve();
    }

    /** 初始化游戏数据表 */
    protected initGameTable(): Promise<void> {
        return Promise.resolve();
    }

    /** 加载资源 加载完后进入游戏 */
    protected loadRes(): Promise<void> {
        return Promise.resolve();
    }

}
