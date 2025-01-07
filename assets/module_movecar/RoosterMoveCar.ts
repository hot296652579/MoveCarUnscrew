import { _decorator, Component, ERaycast2DType, find, Node, PhysicsSystem2D, Tween, tween, Vec2, Vec3 } from 'cc';
import { EventDispatcher } from '../core_tgx/easy_ui_framework/EventDispatcher';
import { CarColorsGlobalInstance } from './Script/CarColorsGlobalInstance';
import { CarDir } from './Script/CarColorsGlobalTypes';
import { CarCarColorsComponent } from './Script/Components/CarCarColorsComponent';
import { GameEvent } from './Script/Enum/GameEvent';
import { LevelManager } from './Script/LevelMgr';
import { CarCarColorsSysterm } from './Script/Systems/CarCarColorsSysterm';
const { ccclass, property } = _decorator;

@ccclass('RoosterMoveCar')
export class RoosterMoveCar extends Component {
    onLoad() {
        LevelManager.instance.initilizeModel();
        CarColorsGlobalInstance.instance.levels = find('Canvas/Scene/Levels')!;
        CarColorsGlobalInstance.instance.carSysterm = this.node.getComponent(CarCarColorsSysterm)!;
        CarColorsGlobalInstance.instance.carSysterm.initData();
        CarColorsGlobalInstance.instance.loadPinPrefab();

        this.registerListener();
    }

    protected start(): void {
        this.startGame();
    }

    async startGame() {
        //DOTO 获取保存等级
        LevelManager.instance.levelModel.level = 1;
        await LevelManager.instance.gameStart();
    }

    registerListener() {
        EventDispatcher.instance.on(GameEvent.EVENT_CLICK_CAR, this.onTouchCar, this);
    }

    onTouchCar(touchCar: Node) {
        let car = touchCar;
        let carComp = car.getComponent(CarCarColorsComponent);
        if (!carComp) return;

        let carWorldPos = car.getWorldPosition().clone();
        let objs = new Vec2(carWorldPos.x, carWorldPos.y);
        let obje = this.createRaycastPosByDir(objs, carComp.carDir);
        // 射线检测
        let results = PhysicsSystem2D.instance.raycast(objs, obje, ERaycast2DType.Closest);
        if (results.length > 0) {
            const closestResult = results[0];
            const collider = results[0].collider;
            //碰到车
            if (collider.group == 1 << 1) {
                const halfLen = carComp.halfLen;
                let forward = null!;
                if (carComp.carDir == CarDir.TOP || carComp.carDir == CarDir.BOTTOM) {
                    forward = new Vec3(0, 1, 0);
                } else {
                    forward = new Vec3(1, 0, 0);
                }

                const carMovePos = carWorldPos.clone().add(forward.clone().multiplyScalar(closestResult.fraction - 5 * halfLen));
                tween(car).to(0.1, {
                    worldPosition: carMovePos
                })
                    .to(0.1, {
                        worldPosition: carWorldPos
                    })
                    .call(() => {
                    })
                    .start()
            }
            else {
                //碰到路
                const parkPoint = this.getEmptyParkPoint()
                if (parkPoint === null) {
                    console.log("没有车位了")
                    return
                }

                // 顶部导航
                let tweenCar: Tween<Node> = tween(car)
                if (collider.node.name === "PhysicRoodTop") {
                    this.hitPointTween(car, parkPoint, tweenCar, collider.node)
                    this.topRoadTween(car, parkPoint, tweenCar)
                } else if (collider.node.name === "PhysicRoodLeft") {
                    const targetPoint = find("Canvas/Scene/Grounds/PhysicRoodTop/LeftPoint")
                    this.hitPointTween(car, targetPoint, tweenCar, collider.node)
                    this.leftRoadTween(car, tweenCar)
                    this.topRoadTween(car, parkPoint, tweenCar)
                } else if (collider.node.name === "PhysicRoodRight") {
                    const targetPoint = find("Canvas/Scene/Grounds/PhysicRoodTop/RightPoint")
                    this.hitPointTween(car, targetPoint, tweenCar, collider.node)
                    this.rightRoadTween(car, tweenCar)
                    this.topRoadTween(car, parkPoint, tweenCar)
                } else if (collider.node.name === "PhysicRoodBottom") {
                    const hitPoint = find("Canvas/Scene/Grounds/PhysicRoodBottom")!;
                    const leftPoint = hitPoint.getChildByName('LeftPoint')!;
                    const rightPoint = hitPoint.getChildByName('RightPoint')!;
                    const toLeft = leftPoint.getWorldPosition().subtract(carWorldPos).normalize();
                    const toRight = rightPoint.getWorldPosition().subtract(carWorldPos).normalize();

                    if (Math.abs(toLeft.x) < Math.abs(toRight.x)) {
                        const targetPoint = find("Canvas/Scene/Grounds/PhysicRoodBottom/LeftPoint")
                        this.hitPointTween(car, targetPoint, tweenCar, collider.node)
                        this.bottomRoadTween(car, targetPoint, tweenCar)
                        this.leftRoadTween(car, tweenCar)
                    } else {
                        const targetPoint = find("Canvas/Scene/Grounds/PhysicRoodBottom/RightPoint")
                        this.hitPointTween(car, targetPoint, tweenCar, collider.node)
                        this.bottomRoadTween(car, targetPoint, tweenCar)
                        this.rightRoadTween(car, tweenCar)
                    }
                    this.topRoadTween(car, parkPoint, tweenCar)
                }

                parkPoint.name = "inuse"
                tweenCar.call(() => {
                    car.setParent(parkPoint, true);
                })
                    .start()
            }
        } else {
            console.log('未检测到碰撞物体');
        }
    }

    /** 获取停车位坐标*/
    getEmptyParkPoint(): Node {
        const points = find("Canvas/Scene/Parkings").children
        for (let i = 0; i < points.length; i++) {
            if (points[i].name === "empty") {
                return points[i]
            }
        }
        return null
    }

    createRaycastPosByDir(objs: Vec2, carDir: CarDir): Vec2 {
        if (carDir == CarDir.TOP) {
            return new Vec2(objs.x, objs.y + 1000);
        } else if (carDir == CarDir.BOTTOM) {
            return new Vec2(objs.x, objs.y - 1000);
        } else if (carDir == CarDir.LEFT) {
            return new Vec2(objs.x - 1000, objs.y);
        } else if (carDir == CarDir.RIGHT) {
            return new Vec2(objs.x + 1000, objs.y);
        }
    }

    /** 导航到碰撞点
     *@param targetPoint 停车点
     *@param hitPoint street碰撞点
    */
    hitPointTween(car: Node, targetPoint: Node, tweenCar: Tween<Node>, hitPoint: Node = null) {
        const newHintStreetPos = hitPoint.getWorldPosition().clone();
        const carWorldPos = car.getWorldPosition();

        // 判断移动方向
        if (Math.abs(newHintStreetPos.x - carWorldPos.x) > Math.abs(newHintStreetPos.y - carWorldPos.y)) {
            // 如果 X 轴差值更大，只改变 X 轴
            newHintStreetPos.x = newHintStreetPos.x;
            newHintStreetPos.y = carWorldPos.y;
        } else {
            // 否则只改变 Y 轴
            newHintStreetPos.x = carWorldPos.x;
            newHintStreetPos.y = newHintStreetPos.y;
        }

        tweenCar.to(0.2, {
            worldPosition: newHintStreetPos
        })
            .call(() => {
                const targetWorldPos = targetPoint.getWorldPosition();
                const direction = targetWorldPos.subtract(newHintStreetPos).normalize();
                console.log('direction:', direction);

                let up: Vec3;
                if (Math.abs(direction.x) > Math.abs(direction.y)) {
                    // 左右方向
                    const leftPoint = hitPoint.getChildByName('LeftPoint')!;
                    const rightPoint = hitPoint.getChildByName('RightPoint')!;
                    const toLeft = leftPoint.getWorldPosition().subtract(carWorldPos).normalize();
                    const toRight = rightPoint.getWorldPosition().subtract(carWorldPos).normalize();

                    if (Math.abs(toLeft.x) < Math.abs(toRight.x)) {
                        up = new Vec3(0, 0, 1);
                    } else {
                        up = new Vec3(0, 0, -1);
                    }
                } else {
                    // 上下方向
                    up = direction.y > 0 ? new Vec3(0, 1, 0) : new Vec3(0, -1, 0);
                }
                car.lookAt(targetWorldPos, up);
            })
            .delay(0.1)
    }

    // 顶部导航
    topRoadTween(car: Node, targetPoint: Node, tweenCar: Tween<Node>) {
        tweenCar.to(0.2, {
            worldPosition: targetPoint.getWorldPosition()
        })
            .call(() => {
                const carforward = car.forward.clone()
                tween(carforward).to(0.1, { x: -1.2, y: 0, z: 2 }, {
                    onUpdate: () => {
                        car.forward = carforward
                    }
                }).start()

                EventDispatcher.instance.emit(GameEvent.EVENT_CHECK_GAME_OVER);
            })
            .delay(0.1)
            .to(0.2, {
                worldPosition: targetPoint.getWorldPosition()
            })

    }
    // 左边导航
    leftRoadTween(car: Node, tweenCar: Tween<Node>) {
        const targetPoint = find("Canvas/Scene/Grounds/PhysicRoodTop/LeftPoint")
        tweenCar.to(0.2, {
            worldPosition: targetPoint.getWorldPosition()
        })
            .call(() => {
                const carforward = car.forward.clone()
                tween(carforward).to(0.1, { x: -1, y: 0, z: 0 }, {
                    onUpdate: () => {
                        car.forward = carforward
                    }
                }).start()
            })
            .delay(0.1)

    }
    // 右边导航
    rightRoadTween(car: Node, tweenCar: Tween<Node>) {
        const targetPoint = find("Canvas/Scene/Grounds/PhysicRoodTop/RightPoint")
        tweenCar.to(0.2, {
            worldPosition: targetPoint.getWorldPosition()
        })
            .call(() => {
                const carforward = car.forward.clone()
                tween(carforward).to(0.1, { x: 1, y: 0, z: 0 }, {
                    onUpdate: () => {
                        car.forward = carforward
                    }
                }).start()
            })
            .delay(0.1)

    }
    // 底部导航
    bottomRoadTween(car: Node, targetPoint: Node, tweenCar: Tween<Node>) {
        tweenCar.to(0.2, {
            worldPosition: targetPoint.getWorldPosition()
        })
            .call(() => {
                const carforward = car.forward.clone()
                tween(carforward).to(0.1, { x: 0, y: 0, z: 1 }, {
                    onUpdate: () => {
                        car.forward = carforward
                    }
                }).start()
            })
            .delay(0.1)

    }

    update(deltaTime: number) {

    }
}


