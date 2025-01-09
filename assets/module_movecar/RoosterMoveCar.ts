import { _decorator, Component, ERaycast2DType, find, Node, PhysicsSystem2D, Tween, tween, v2, v3, Vec2, Vec3 } from 'cc';
import { EventDispatcher } from '../core_tgx/easy_ui_framework/EventDispatcher';
import { CarColorsGlobalInstance } from './Script/CarColorsGlobalInstance';
import { CarDir } from './Script/CarColorsGlobalTypes';
import { CarCarColorsComponent } from './Script/Components/CarCarColorsComponent';
import { GameEvent } from './Script/Enum/GameEvent';
import { LevelManager } from './Script/LevelMgr';
import { CarCarColorsSysterm } from './Script/Systems/CarCarColorsSysterm';
import { GameUtil } from './Script/GameUtil';
const { ccclass, property } = _decorator;

@ccclass('RoosterMoveCar')
export class RoosterMoveCar extends Component {
    onLoad() {
        LevelManager.instance.initilizeModel();
        CarColorsGlobalInstance.instance.levels = find('Canvas/Scene/Levels')!;
        CarColorsGlobalInstance.instance.carSysterm = this.node.getComponent(CarCarColorsSysterm)!;
        CarColorsGlobalInstance.instance.loadPinPrefab();

        this.registerListener();
    }

    protected start(): void {
        this.startGame();
    }

    async startGame() {
        //DOTO 获取保存等级
        LevelManager.instance.levelModel.level = 3;
        await LevelManager.instance.gameStart();
    }

    registerListener() {
        EventDispatcher.instance.on(GameEvent.EVENT_CLICK_CAR, this.onTouchCar, this);
    }

    onTouchCar(touchCar: Node) {
        let car = touchCar;
        let carComp = car.getComponent(CarCarColorsComponent);
        if (!carComp) return;

        const carWorldPos = car.getWorldPosition().clone();
        const objs = GameUtil.getWorldPositionAsVec2(car);
        const obje = this.calculateRayEnd(car);
        // const obje = this.createRaycastPosByDir(objs, car, carComp.carDir);

        console.log('射线起点：', objs);
        console.log('射线终点：', obje);
        // 射线检测
        let results = PhysicsSystem2D.instance.raycast(objs, obje, ERaycast2DType.Closest);
        if (results.length > 0) {
            const closestResult = results[0];

            const collider = results[0].collider;
            console.log('碰撞器名称:', collider.name);
            console.log('碰撞点世界坐标:', results[0].point);
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

                const targetWorldPos = results[0].point;
                // 顶部导航
                let tweenCar: Tween<Node> = tween(car)
                if (collider.node.name === "PhysicRoodTop") {
                    // this.hitPointTween(car, parkPoint, tweenCar, collider.node)
                    this.hitPointTween2(car, targetWorldPos, tweenCar, collider.node)
                    this.topRoadTween(car, parkPoint, tweenCar)
                } else if (collider.node.name === "PhysicRoodLeft") {
                    const targetPoint = find("Canvas/Scene/Grounds/PhysicRoodTop/LeftPoint")
                    // this.hitPointTween(car, targetPoint, tweenCar, collider.node);
                    this.hitPointTween2(car, targetWorldPos, tweenCar, collider.node)
                    this.leftRoadTween(car, tweenCar)
                    this.leftTopToRight(car, parkPoint, tweenCar)
                    this.topRoadTween(car, parkPoint, tweenCar)
                } else if (collider.node.name === "PhysicRoodRight") {
                    const targetPoint = find("Canvas/Scene/Grounds/PhysicRoodTop/RightPoint")
                    // this.hitPointTween(car, targetPoint, tweenCar, collider.node)
                    this.hitPointTween2(car, targetWorldPos, tweenCar, collider.node)
                    this.rightRoadTween(car, tweenCar)
                    this.rightTopToleft(car, parkPoint, tweenCar)
                    this.topRoadTween(car, parkPoint, tweenCar)
                } else if (collider.node.name === "PhysicRoodBottom") {
                    const hitPoint = find("Canvas/Scene/Grounds/PhysicRoodBottom")!;
                    const leftPoint = hitPoint.getChildByName('LeftPoint')!;
                    const rightPoint = hitPoint.getChildByName('RightPoint')!;
                    const toLeft = leftPoint.getWorldPosition().subtract(carWorldPos).normalize();
                    const toRight = rightPoint.getWorldPosition().subtract(carWorldPos).normalize();

                    if (Math.abs(toLeft.x) < Math.abs(toRight.x)) {
                        const targetPoint = find("Canvas/Scene/Grounds/PhysicRoodBottom/LeftPoint")
                        // this.hitPointTween(car, targetPoint, tweenCar, collider.node)
                        this.hitPointTween2(car, targetWorldPos, tweenCar, collider.node)
                        this.bottomRoadTween(car, targetPoint, tweenCar)
                        this.leftRoadTween(car, tweenCar)
                        this.leftTopToRight(car, parkPoint, tweenCar)
                    } else {
                        const targetPoint = find("Canvas/Scene/Grounds/PhysicRoodBottom/RightPoint")
                        // this.hitPointTween(car, targetPoint, tweenCar, collider.node)
                        this.hitPointTween2(car, targetWorldPos, tweenCar, collider.node)
                        this.bottomRoadTween(car, targetPoint, tweenCar)
                        this.rightRoadTween(car, tweenCar)
                        this.rightTopToleft(car, parkPoint, tweenCar)
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

    createRaycastPosByDir(objs: Vec2, car: Node, carDir: CarDir): Vec2 {
        const rotation = car.angle;
        const radians = rotation * (Math.PI / 180);
        const direction = v2(Math.cos(radians), Math.sin(radians));//方向向量

        //DOTO 根据角度方向获取射线终点
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

    calculateRayEnd(car: Node): Vec2 {
        const rotation = car.angle;

        // 根据角度计算方向向量
        let direction = v2(0, 0);
        if (rotation === -90) {
            direction = v2(1, 0); // 朝右
        } else if (rotation === 0) {
            direction = v2(0, 1); // 朝上
        } else if (rotation === 90) {
            direction = v2(-1, 0); // 朝左
        } else if (rotation === 180) {
            direction = v2(0, -1); // 朝下
        } else {
            const adjustedAngle = rotation - 90;
            direction = v2(-Math.cos(adjustedAngle * (Math.PI / 180)), Math.sin(-adjustedAngle * (Math.PI / 180)));
        }

        // 计算射线起点坐标
        const objs = GameUtil.getWorldPositionAsVec2(car);

        // 计算射线终点坐标
        const rayLength = 1000; // 射线长度
        const obje = objs.add(direction.multiplyScalar(rayLength));

        return obje;
    }

    /** 导航到碰撞点
     * @param car 车节点
     *@param targetWorldPos 碰撞点的世界坐标
     *@param tweenCar 车的tween动画
     *@param hitPoint street碰撞点
    */
    hitPointTween2(car: Node, targetWorldPos: Vec2, tweenCar: Tween<Node>, hitPoint: Node = null) {
        const targetV3 = new Vec3(targetWorldPos.x, targetWorldPos.y, 0);

        tweenCar
            .to(0.2, { worldPosition: targetV3 }, { easing: 'quadInOut' })
            .call(() => {
                const carWorldPos = car.getWorldPosition().clone();
                const direction = targetV3.subtract(carWorldPos).normalize();
                // console.log('direction:', direction);

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
                    // up = direction.y > 0 ? new Vec3(0, -1, 0) : new Vec3(0, 1, 0);
                    // console.log('hitPoint.name:', hitPoint.name);
                    if (hitPoint.name == 'PhysicRoodBottom' || hitPoint.name == 'PhysicRoodTop') {
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
                        up = direction.y > 0 ? new Vec3(0, -1, 0) : new Vec3(0, 1, 0);
                    }
                }
                car.lookAt(targetV3, up);
            })
            .start();
    }

    carDirection(car: Node) {
        const rotation = car.angle;

        // 计算移动方向
        let direction = v3(0, 0, 0);
        if (rotation === -90) {
            direction = v3(1, 0, 0); // 朝右
        } else if (rotation === 0) {
            direction = v3(0, 1, 0); // 朝上
        } else if (rotation === 90) {
            direction = v3(-1, 0, 0); // 朝左
        } else if (rotation === 180) {
            direction = v3(0, -1, 0); // 朝下
        } else {
            // 如果是任意角度，使用 Math.cos 和 Math.sin 计算方向向量
            const radians = rotation * (Math.PI / 180);
            direction = v3(Math.cos(radians), Math.sin(radians), 0);
        }

        return direction;
    }

    /** 导航到碰撞点
     *@param targetPoint 下一个目标点
     *@param hitPoint street碰撞点
    */
    // hitPointTween(car: Node, targetPoint: Node, tweenCar: Tween<Node>, hitPoint: Node = null) {
    //     const newHintStreetPos = hitPoint.getWorldPosition().clone();
    //     const carWorldPos = car.getWorldPosition();

    //     const carDir = car.getComponent(CarCarColorsComponent)!.carDir;
    //     if (carDir == CarDir.LEFT || carDir == CarDir.RIGHT) {
    //         // 判断移动方向
    //         if (Math.abs(newHintStreetPos.x - carWorldPos.x) > Math.abs(newHintStreetPos.y - carWorldPos.y)) {
    //             // 如果 X 轴差值更大，只改变 X 轴
    //             newHintStreetPos.x = newHintStreetPos.x;
    //             newHintStreetPos.y = carWorldPos.y;
    //         } else {
    //             // 否则只改变 Y 轴
    //             newHintStreetPos.x = carWorldPos.x;
    //             newHintStreetPos.y = newHintStreetPos.y;
    //         }
    //     } else if (carDir == CarDir.TOP || carDir == CarDir.BOTTOM) {
    //         newHintStreetPos.x = carWorldPos.x;
    //         newHintStreetPos.y = newHintStreetPos.y;
    //     }

    //     tweenCar.to(0.2, {
    //         worldPosition: newHintStreetPos
    //     })
    //         .call(() => {
    //             const targetWorldPos = targetPoint.getWorldPosition();
    //             const direction = targetWorldPos.subtract(newHintStreetPos).normalize();
    //             // console.log('direction:', direction);

    //             let up: Vec3;
    //             if (Math.abs(direction.x) > Math.abs(direction.y)) {
    //                 // 左右方向
    //                 const leftPoint = hitPoint.getChildByName('LeftPoint')!;
    //                 const rightPoint = hitPoint.getChildByName('RightPoint')!;
    //                 const toLeft = leftPoint.getWorldPosition().subtract(carWorldPos).normalize();
    //                 const toRight = rightPoint.getWorldPosition().subtract(carWorldPos).normalize();

    //                 if (Math.abs(toLeft.x) < Math.abs(toRight.x)) {
    //                     up = new Vec3(0, 0, 1);
    //                 } else {
    //                     up = new Vec3(0, 0, -1);
    //                 }
    //             } else {
    //                 // 上下方向
    //                 up = direction.y > 0 ? new Vec3(0, 1, 0) : new Vec3(0, -1, 0);
    //             }
    //             car.lookAt(targetWorldPos, up);
    //         })
    //         .delay(0.1)
    //         .start();
    // }

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

    //左边顶部转向右
    leftTopToRight(car: Node, targetPoint: Node, tweenCar: Tween<Node>) {
        //转向右边动画
        const targetWorldPos = targetPoint.getWorldPosition().clone()
        tweenCar.to(0.2, {
            eulerAngles: new Vec3(0, 0, -90)
        })
            .delay(0.2)
            .to(0.2, { worldPosition: new Vec3(targetWorldPos.x, targetWorldPos.y - 100, targetWorldPos.z) })
            .delay(0.2)
            .to(0.2, { eulerAngles: new Vec3(0, 0, 0) })
            .start()
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

    //右边顶部转向左
    rightTopToleft(car: Node, targetPoint: Node, tweenCar: Tween<Node>) {
        //转向左边动画
        const targetWorldPos = targetPoint.getWorldPosition().clone()
        tweenCar.to(0.2, {
            eulerAngles: new Vec3(0, 0, 90)
        })
            .delay(0.2)
            .to(0.2, { worldPosition: new Vec3(targetWorldPos.x, targetWorldPos.y - 100, targetWorldPos.z) })
            .delay(0.2)
            .to(0.2, { eulerAngles: new Vec3(0, 0, 0) })
            .start()
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


