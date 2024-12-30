import { _decorator, assetManager, BoxCollider2D, CircleCollider2D, Component, find, instantiate, PolygonCollider2D, Prefab, RigidBody2D, Node } from "cc";
import { HoleComponent } from "../Components/HoleComponent";
import { resLoader } from "db://assets/core_tgx/base/ResLoader";
import { CarColorsGlobalInstance } from "../CarColorsGlobalInstance";
import { PinComponent } from "../Components/PinComponent";
import { CarModel } from "../CarModel";
import { CarCarColorsComponent } from "../Components/CarCarColorsComponent";
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
                    const carColor = CarColorsGlobalInstance.instance.carSysterm.carSeats.pop()
                    const pin = instantiate(this.pin);
                    const holeNode = hole.node.getChildByName('hole')!;
                    pin.getComponent(PinComponent)!.init_date(group, carColor, hole.getComponent(HoleComponent));
                    pin.name = 'pin';
                    holeNode.addChild(pin);
                })
            })
        })
    }

    moveToCar() {
        const points = find("Canvas/Scene/Parkings").children
        let cars: Array<Node> = []
        let isEmpty = false
        for (let i = points.length; i--;) {
            if (points[i].name === "inuse" && points[i].children.length === 1) {
                cars.push(points[i].children[0])
                continue
            }

            if (points[i].name === "empty") {
                isEmpty = true
                continue
            }
        }

        if (cars.length === 0) {
            // console.log("没车了")
            return
        }

        //找到顶部层级layer 遍历里面钉子
        let pinCom = null;
        const layers = this.node.children;
        const bottomLayers = layers.slice(-1);
        bottomLayers.forEach((layer) => {
            if (layer.children.length == 0) {
                layer.active = false;
                layer.removeFromParent();
            }

            layer.children.forEach((element) => {
                const holes = element.getComponentsInChildren(HoleComponent)!;
                holes.forEach((hole) => {
                    if (hole.node.getChildByName('hole')!.getChildByName('pin')) {
                        const pin = hole.node.getChildByName('hole')!.getChildByName('pin')!;
                        pinCom = pin.getComponent(PinComponent)!;
                    }
                })
            });
        })

        if (pinCom) {
            let selectedCar: Node = null
            for (let i = cars.length; i--;) {
                const car = cars[i]
                const carComp = car.getComponent(CarCarColorsComponent)
                // 颜色相同
                if (carComp.carColor === pinCom.pin_color) {
                    if (selectedCar === null) {
                        selectedCar = car
                        continue
                    }
                    if (selectedCar.getComponent(CarCarColorsComponent).roleNum === 0) {
                        selectedCar = car
                    }
                }
            }

            // 匹配的车
            if (selectedCar !== null) {
                if (selectedCar.getComponent(CarCarColorsComponent).addRole(pinCom.node)) {
                    selectedCar.setParent(find("Canvas/Scene/Levels"), true)
                }
            } else {

                // 游戏结束判定
                if (!isEmpty) {
                    console.log("游戏结束！！！！");
                }
                return
            }
        }
    }

    protected update(dt: number): void {
        this.moveToCar();
    }

}