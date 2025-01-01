/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2025-01-01 09:28:17
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2025-01-01 18:28:17
 * @FilePath: /MoveCarUnscrew/assets/module_movecar/Script/CarColorsGlobalInstance.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { _decorator, assetManager, Component, Node, Prefab } from 'cc';
import { resLoader } from '../../core_tgx/base/ResLoader';
import { ResourcePool } from './ResourcePool';
import { CarCarColorsSysterm } from './Systems/CarCarColorsSysterm';

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

            resLoader.loadAsync(resLoader.gameBundleName, `Prefabs/pin`, Prefab).then((prefab: Prefab) => {
                resolve(prefab);
            })
        })
    }

    public levels: Node = null;
    public carSysterm: CarCarColorsSysterm = null;
}


