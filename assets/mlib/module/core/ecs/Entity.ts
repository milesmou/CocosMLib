export class Entity {

    private _entitys: Entity[] = [];

    public add<T extends Entity>(ctor: { new(): T }): T {
        let entity = new ctor();
        this._entitys.push(entity);
        return entity;
    }

    public remove<T extends Entity>(ctor: { new(): T }): boolean {
        let index = this._entitys.findIndex(entity => entity instanceof ctor);
        if (index > -1) {
            this._entitys.splice(index, 1);
            return true;
        }
        return false;
    }

    public get<T extends Entity>(ctor: { new(): T }): T {
        for (const entity of this._entitys) {
            if (entity instanceof ctor) return entity;
        }
        return null;
    }

}   

