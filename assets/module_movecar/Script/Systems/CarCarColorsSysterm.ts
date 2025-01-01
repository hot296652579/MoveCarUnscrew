import { _decorator, Component, find, geometry, Node, PhysicsSystem } from 'cc';
import { CarColors, CarTypes } from '../CarColorsGlobalTypes';
import { CarBoxComponent } from '../Components/CarBoxComponent';
import { CarCarColorsComponent } from '../Components/CarCarColorsComponent';
const { ccclass, property } = _decorator;

@ccclass('CarCarColorsSysterm')
export class CarCarColorsSysterm extends Component {
    activeCar: Map<string, Node> = new Map()

    carSeats: Array<CarColors> = []

    carBoxMap: Array<CarBoxComponent> = []

    initData() {
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
        let len = 10
        if (carType === CarTypes.Minivan) {
            len = 6
        }
        else if (carType === CarTypes.Sedan) {
            len = 4
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

    //DOTO 刷新车方式改变
    refreshCar() {
        const cars = find("Scene/Levels").children[0].children

        const miniCars: { cars: Array<Node>, colors: Array<CarColors> } = {
            cars: [],
            colors: []
        }
        const middleCars: { cars: Array<Node>, colors: Array<CarColors> } = {
            cars: [],
            colors: []
        }
        const bigCars: { cars: Array<Node>, colors: Array<CarColors> } = {
            cars: [],
            colors: []
        }
        cars.forEach(car => {
            const carCom = car.getComponent(CarCarColorsComponent)
            if (!carCom) return
            if (carCom.carType === CarTypes.Sedan) {
                miniCars.cars.push(car)
                miniCars.colors.push(carCom.carColor)
                return
            }
            if (carCom.carType === CarTypes.Minivan) {
                middleCars.cars.push(car)
                middleCars.colors.push(carCom.carColor)
                return
            }
            if (carCom.carType === CarTypes.Bus) {
                bigCars.cars.push(car)
                bigCars.colors.push(carCom.carColor)
                return
            }
        })

        miniCars.colors.sort(() => Math.random() - 0.5);
        middleCars.colors.sort(() => Math.random() - 0.5);
        bigCars.colors.sort(() => Math.random() - 0.5);
        miniCars.cars.forEach((car, index) => {
            car.getComponent(CarCarColorsComponent).carColor = miniCars.colors[index]
        })
        middleCars.cars.forEach((car, index) => {
            car.getComponent(CarCarColorsComponent).carColor = middleCars.colors[index]
        })
        bigCars.cars.forEach((car, index) => {
            car.getComponent(CarCarColorsComponent).carColor = bigCars.colors[index]
        })
    }

    checkCarBox() {
        if (this.carBoxMap.length === 0) return

        let mask = 1 << 1; //车分组
        let maxDistance = 100;
        let queryTrigger = true;
        for (let i = this.carBoxMap.length; i--;) {
            const carBoxCom = this.carBoxMap[i]
            if (carBoxCom.isAnimateOut) continue
            if (carBoxCom.num <= 0) {
                this.carBoxMap.splice(i, 1)
                continue
            }
            const pos = carBoxCom.node.getWorldPosition()
            const forward = carBoxCom.node.forward.clone()
            // 检测前方第一个碰撞体
            const ray = new geometry.Ray(pos.x, pos.y, pos.z, forward.x, forward.y, forward.z)
            // 前方没有障碍物
            if (!PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {
                carBoxCom.outCarTween()
            }
        }
    }

    protected lateUpdate(dt: number): void {
        //DOTO 检测车盒子
        this.checkCarBox()
    }
}


