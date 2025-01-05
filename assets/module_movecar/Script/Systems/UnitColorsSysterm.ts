import { Component, Node, _decorator, find } from "cc";
import { CarCarColorsComponent } from "../Components/CarCarColorsComponent";
import { HoleComponent } from "../Components/HoleComponent";
import { PinComponent } from "../Components/PinComponent";
import { CarColorsGlobalInstance } from "../CarColorsGlobalInstance";
import { UnitAction } from "../UnitAction";
import { EventDispatcher } from "db://assets/core_tgx/easy_ui_framework/EventDispatcher";
import { GameEvent } from "../Enum/GameEvent";
import { LevelAction } from "../LevelAction";
const { ccclass, property } = _decorator;

@ccclass('UnitColorsSysterm')
export class UnitColorsSysterm extends Component {

    protected start(): void {
        this.registerEvent();
    }

    registerEvent() {
        EventDispatcher.instance.on(GameEvent.EVENT_MAGNET, this.moveToCar, this);
    }

    async moveToCar() {
        const level = CarColorsGlobalInstance.instance.levels.children[0];
        const points = find("Canvas/Scene/Parkings").children

        let findPins = [];
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

        let pinCom = null;
        let layer_arr = level.getComponent(LevelAction)!.get_all_layer();
        layer_arr.reverse();
        layer_arr.forEach(layer => {
            layer.node.children.forEach((element) => {
                const pins = element.getComponentsInChildren(PinComponent)!;
                pins.forEach(async (pin) => {
                    pinCom = pin.getComponent(PinComponent)!;

                    let selectedCar: Node = null
                    for (let i = cars.length; i--;) {
                        const car = cars[i]
                        const carComp = car.getComponent(CarCarColorsComponent);

                        if (carComp.isFull)
                            continue

                        // 颜色相同
                        // console.log('车颜色:', carComp.carColor, '钉子颜色:', pinCom.pin_color);
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
                        findPins.push(pinCom.node);
                    }
                })
            });
        });

        console.log('findPins总数:', findPins.length);
    }
}