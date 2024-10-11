export class Entity {

    private _isVaild = true;

    private _entitys: Entity[] = [];

    public get isValid() { return this._isVaild; }

    public constructor() {
        this._onCreate();
        this.onCreate();
    }

    /** 在onCreate方法之前执行 */
    private _onCreate() {

    }

    /** 创建实例时执行 */
    protected onCreate() {

    }

    /** 在onDestroy方法之前执行 */
    private _onDestroy() {

    }

    /** 销毁实例时执行 */
    protected onDestroy() {

    }


    public add<T extends Entity>(ctor: { new(): T }): T {
        let entity = new ctor();
        this._entitys.push(entity);
        return entity;
    }

    public remove<T extends Entity>(ctor: { new(): T }): boolean {
        let index = this._entitys.findIndex(entity => entity instanceof ctor);
        if (index > -1) {
            this._entitys[index].destory();
            this._entitys.splice(index, 1);
            return true;
        }
        return false;
    }

    public get<T extends Entity>(ctor: { new(): T }): T {
        for (const entity of this._entitys) {
            if (entity instanceof ctor) return entity;
        }
        return null!;
    }

    public destory() {
        this._isVaild = false;
        this._onDestroy();
        this.onDestroy();
        for (const entity of this._entitys) {
            entity.destory();
        }
    }

}