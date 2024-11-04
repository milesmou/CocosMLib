import { Entity } from "./Entity";

export class ECS {
    public Entity = Entity;



}


(globalThis as any).ecs = ECS;