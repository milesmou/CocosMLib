import { Entity } from "./Entity";

export class ViewEntity extends Entity {
    private _view!: Entity;
    public get view(): Entity { return this._view; }


}