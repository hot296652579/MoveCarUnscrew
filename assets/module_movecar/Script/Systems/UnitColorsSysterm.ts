import { Component, Node, _decorator, find } from "cc";
import { CarCarColorsComponent } from "../Components/CarCarColorsComponent";
import { HoleComponent } from "../Components/HoleComponent";
import { PinComponent } from "../Components/PinComponent";
import { CarColorsGlobalInstance } from "../CarColorsGlobalInstance";
import { UnitAction } from "../UnitAction";
const { ccclass, property } = _decorator;

@ccclass('UnitColorsSysterm')
export class UnitColorsSysterm extends Component {
    layer_group_id = 0;

    protected start(): void {
        this.registerEvent();
    }

    registerEvent() {
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
        const units = CarColorsGlobalInstance.instance.levels.getComponentsInChildren(UnitAction)!;
        units.forEach((unit) => {
            let pinCom = null;
            const layers = unit.node.children;
            const bottomLayers = layers.slice(-2);
            bottomLayers.forEach((layer) => {
                layer.children.forEach((element) => {
                    const holes = element.getComponentsInChildren(HoleComponent)!;
                    holes.forEach((hole) => {
                        if (hole.node.getChildByName('hole')!.getChildByName('pin')) {
                            const pin = hole.node.getChildByName('hole')!.getChildByName('pin')!;
                            pinCom = pin.getComponent(PinComponent)!;

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
                    })
                });
            })
        })
    }

    protected update(dt: number): void {
        this.moveToCar();
    }

    //获取是否还有钉子
    pinIsEmpty() {
        this.node.children.forEach((layer) => {
            if (layer.children.length > 0) {
                return false;
            }
        })
        return true;
    }

}