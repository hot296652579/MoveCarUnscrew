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

    findPins: Node[] = [];
    selectedCar: Node = null;

    protected start(): void {
        this.registerEvent();
    }

    registerEvent() {
        EventDispatcher.instance.on(GameEvent.EVENT_MAGNET, this.onMagnet, this);
    }

    private onMagnet() {
        this.findPinsCar();
        this.moveToCar();
    }

    findPinsCar() {
        const level = CarColorsGlobalInstance.instance.levels.children[0];
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

        if (cars.length <= 0) {
            console.log('停车场没有车');
            return
        }

        this.selectedCar = cars[cars.length - 1]; //找最左边的车
        const layer_arr = level.getComponent(LevelAction)!.get_all_layer();
        const layers = layer_arr.reverse();
        let magnetIndex = 0;
        layers.forEach(layer => {
            layer.node.children.forEach((element) => {
                const pins = element.getComponentsInChildren(PinComponent)!;
                pins.forEach(async (pin, index) => {
                    const pinCom = pin.getComponent(PinComponent)!;

                    const carComp = this.selectedCar.getComponent(CarCarColorsComponent);
                    const remainSeat = carComp.getRemainSeat();

                    if (pinCom.pin_color == carComp.carColor) {
                        magnetIndex++;
                        if (magnetIndex <= remainSeat) {
                            this.findPins.push(pinCom.node);
                        }
                    }
                })
            });
        });
    }

    moveToCar() {
        if (this.selectedCar != null) {
            this.findPins.forEach(pin => {
                this.selectedCar.getComponent(CarCarColorsComponent).addRole(pin);
            })
        }

        this.clearpinsCar();
    }

    clearpinsCar() {
        this.selectedCar = null
        this.findPins = []
    }
}