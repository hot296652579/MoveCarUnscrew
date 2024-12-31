import { _decorator, Prefab, Node, instantiate, NodePool, Vec3 } from "cc";

const { ccclass, property } = _decorator;

@ccclass("ResourcePool")
export class ResourcePool {
    private prefab_pool: any = {}
    static rp: ResourcePool;
    static get instance() {
        if (!this.rp) {
            this.rp = new ResourcePool();
            window["rp"] = this.rp;
        }

        return this.rp;
    }
    public set_prefab(name: string, prefab: Prefab): void {
        this.prefab_pool[name] = prefab;
    }

    public get_prefab(name: string): Prefab {
        return this.prefab_pool[name];
    }
}
