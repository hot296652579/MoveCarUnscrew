import { _decorator, assetManager, Component, Node, Prefab } from 'cc';
import { CarCarColorsSysterm } from './Systems/CarCarColorsSysterm';
import { resLoader } from '../../core_tgx/base/ResLoader';
import { ResourcePool } from './ResourcePool';

const { ccclass, property } = _decorator;

@ccclass('CarColorsGlobalInstance')
export class CarColorsGlobalInstance extends Component {
    private static _instance: CarColorsGlobalInstance;
    public static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new CarColorsGlobalInstance();
        return this._instance;
    }

    async loadPinPrefab() {
        const prefab = await this.loadAsyncPin();
        ResourcePool.instance.set_prefab(prefab.name, prefab);
    }

    async loadAsyncPin(): Promise<Prefab> {
        return new Promise((resolve, reject) => {
            const bundle = assetManager.getBundle(resLoader.gameBundleName);
            if (!bundle) {
                console.error("module_nut is null!");
                reject();
            }

            resLoader.loadAsync(resLoader.gameBundleName, `Prefabs/Unit/pin`, Prefab).then((prefab: Prefab) => {
                resolve(prefab);
            })
        })
    }

    public levels: Node = null;
    public carSysterm: CarCarColorsSysterm = null;
}


