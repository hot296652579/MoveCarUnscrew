import { _decorator, Component, ERaycast2DType, find, geometry, Node, PhysicsSystem, PhysicsSystem2D } from 'cc';
import { CarColorLog, CarColors, CarTypes } from '../CarColorsGlobalTypes';
import { CarBoxComponent } from '../Components/CarBoxComponent';
import { CarCarColorsComponent } from '../Components/CarCarColorsComponent';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
import { CarColorsGlobalInstance } from '../CarColorsGlobalInstance';
import { LevelAction } from '../LevelAction';
import { PinComponent } from '../Components/PinComponent';
import { GameUtil } from '../GameUtil';
const { ccclass, property } = _decorator;

@ccclass('CarCarColorsSysterm')
export class CarCarColorsSysterm extends Component {
    activeCar: Map<string, Node> = new Map()

    carSeats: Array<CarColors> = []

    carBoxMap: Array<CarBoxComponent> = []

    protected start(): void {
        EventDispatcher.instance.on(GameEvent.EVENT_REFRESH_COLOR, this.refreshCarColor, this);
    }

    protected onDestroy(): void {
        EventDispatcher.instance.off(GameEvent.EVENT_REFRESH_COLOR, this.refreshCarColor);
    }

    addCar(node: Node) {
        const carBoxCom = node.getComponent(CarBoxComponent)
        if (carBoxCom) {
            this.carBoxMap.push(carBoxCom)
            node.getChildByName("cars").children.forEach((car) => {
                this.addCar(car)
            })
            return
        }
        this.activeCar.set(node.uuid, node)
        if (!node.getComponent(CarCarColorsComponent)) return;
        const color = node.getComponent(CarCarColorsComponent).carColor
        const carType = node.getComponent(CarCarColorsComponent).carType
        let len = 0;
        if (carType === CarTypes.Bus) {
            len = 10
        }
        else if (carType === CarTypes.Minivan) {
            len = 6
        } else if (carType === CarTypes.Sedan) {
            len = 4
        } else if (carType === CarTypes.Single) {
            len = 1
        }

        for (; len--;) {
            this.carSeats.push(color)
        }
        // console.log(this.carSeats);
    }

    removeCar(node: Node) {
        this.activeCar.delete(node.uuid)
        console.log(this.activeCar);
    }

    clearAll() {
        this.activeCar.clear()
        this.carBoxMap.length = 0
        this.carBoxMap = []

        this.carSeats.length = 0
        this.carSeats = []

    }

    refreshCarColor() {
        // 找出外圈没被挡住的车子
        const canOutCar: CarCarColorsComponent[] = [];
        const cars = find("Canvas/Scene/Levels").children[0].getComponentsInChildren(CarCarColorsComponent)!;
        cars.forEach(car => {
            const carComp = car.getComponent(CarCarColorsComponent);
            const collider = carComp.checkCollision();

            if (!collider) {
                canOutCar.push(car);
            }
        });

        // 找出待解锁的钉子颜色
        const level = CarColorsGlobalInstance.instance.levels.children[0];
        const layer_arr = level.getComponent(LevelAction)!.get_all_layer();
        let topPins: Set<CarColors> = new Set();

        layer_arr.forEach(layer => {
            if (layer.layer_status == 1) {
                layer.node.children.forEach((element) => {
                    const pins = element.getComponentsInChildren(PinComponent)!;
                    pins.forEach(async (pin) => {
                        const pinCom = pin.getComponent(PinComponent)!;
                        if (!pinCom.isBlocked) {
                            if (!topPins.has(pinCom.pin_color)) {
                                topPins.add(pinCom.pin_color);
                            }
                        }
                    });
                });
            }
        });

        // 按车类型分组
        const carTypes = new Map<CarTypes, CarCarColorsComponent[]>();
        cars.forEach(car => {
            const carType = car.carType;
            if (!carTypes.has(carType)) {
                carTypes.set(carType, []);
            }
            carTypes.get(carType)!.push(car);
        });

        // 检查是否有同类型的车可以交换颜色
        let hasSameTypeCars = false;
        carTypes.forEach((carsOfType, type) => {
            if (carsOfType.length > 1) {
                hasSameTypeCars = true;
            }
        });

        if (!hasSameTypeCars) {
            console.log("没有同类型的车可以交换颜色！");
            return; // 如果没有同类型的车，直接返回
        }

        // 在同类型的车之间交换颜色
        carTypes.forEach((carsOfType, type) => {
            if (carsOfType.length > 1) {
                // 随机交换颜色
                for (let i = 0; i < carsOfType.length; i++) {
                    const j = Math.floor(Math.random() * carsOfType.length);
                    const tempColor = carsOfType[i].carColor;
                    carsOfType[i].carColor = carsOfType[j].carColor;
                    carsOfType[j].carColor = tempColor;
                }
            }
        });

        // 检查可开出的车中是否至少有一个车的颜色是待解锁的钉子颜色之一
        let hasValidColor = false;
        canOutCar.forEach(car => {
            if (topPins.has(car.carColor)) {
                hasValidColor = true;
            }
        });

        if (!hasValidColor && canOutCar.length > 0) {
            // 如果没有符合条件的车，将第一个可开出的车的颜色改为待解锁的钉子颜色之一
            const firstCar = canOutCar[0];
            const newColor = Array.from(topPins)[0]; // 取第一个待解锁的颜色
            firstCar.carColor = newColor;
        }
    }

    checkCarBox() {
        if (this.carBoxMap.length === 0) return

        let mask = 1 << 1; //车分组
        let maxDistance = 300;
        let queryTrigger = true;
        for (let i = this.carBoxMap.length; i--;) {
            const carBoxCom = this.carBoxMap[i]
            if (carBoxCom.isAnimateOut) continue
            if (carBoxCom.num <= 0) {
                this.carBoxMap.splice(i, 1)
                continue
            }

            const car = carBoxCom.node;
            const objs = GameUtil.getWorldPositionAsVec2(car);
            const obje = GameUtil.calculateRayEnd(car, maxDistance);

            let results = PhysicsSystem2D.instance.raycast(objs, obje, ERaycast2DType.Closest);
            if (results.length == 0) {
                // console.log("没有障碍物>>>>>>>");
                carBoxCom.outCarTween();
            } else {
                // console.log("有障碍物:", results[0].collider.node.name);
            }
        }
    }

    protected lateUpdate(dt: number): void {
        //DOTO 检测车盒子
        this.checkCarBox()
    }
}


