import { _decorator, assetManager, BoxCollider2D, CircleCollider2D, Component, instantiate, PolygonCollider2D, Prefab, RigidBody2D } from "cc";
import { HoleComponent } from "../Components/HoleComponent";
import { resLoader } from "db://assets/core_tgx/base/ResLoader";
import { CarColorsGlobalInstance } from "../CarColorsGlobalInstance";
import { PinComponent } from "../Components/PinComponent";
import { CarModel } from "../CarModel";
const { ccclass, property } = _decorator;

@ccclass('UnitColorsSysterm')
export class UnitColorsSysterm extends Component {

    pin: Prefab = null!;

    protected async onLoad() {
        this.pin = await this.loadAsyncPin();
        this.initUI();
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

    protected initUI(): void {
        this.node.children.forEach((layer) => {
            const group = CarColorsGlobalInstance.instance.carSysterm.getLayerGroup();
            layer.children.forEach((element) => {
                element.getComponent(RigidBody2D)!.group = group;
                element.getComponents(BoxCollider2D).forEach(element => {
                    element.group = group;
                });
                element.getComponents(CircleCollider2D).forEach(element => {
                    element.group = group;
                });
                element.getComponents(PolygonCollider2D).forEach(element => {
                    element.group = group;
                });

                const holes = element.getComponentsInChildren(HoleComponent)!;
                holes.forEach((hole) => {
                    const carColor = CarColorsGlobalInstance.instance.carSysterm.getCarSeatsRandomColor();
                    const pin = instantiate(this.pin);
                    pin.getComponent(PinComponent)!.init_date(group, carColor, hole);
                    hole.node.getChildByName('hole')!.addChild(pin);
                })

            })
        })
    }

}