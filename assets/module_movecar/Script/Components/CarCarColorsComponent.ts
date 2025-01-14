import { _decorator, CCFloat, CircleCollider2D, Component, Enum, ERaycast2DType, EventTouch, find, Input, Node, PhysicsSystem2D, tween, v2, v3, Vec2, Vec3 } from 'cc';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { tgxUIMgr } from 'db://assets/core_tgx/tgx';
import { UI_BattleResult } from 'db://assets/scripts/UIDef';
import { CarColorsGlobalInstance } from '../CarColorsGlobalInstance';
import { CarColors, CarDir, CarTypes } from '../CarColorsGlobalTypes';
import { GameEvent } from '../Enum/GameEvent';
import { LevelAction } from '../LevelAction';
import { LevelManager } from '../LevelMgr';
import { GameUtil } from '../GameUtil';
const { ccclass, property, executeInEditMode } = _decorator;
@ccclass('CarCarColorsComponent')
@executeInEditMode
export class CarCarColorsComponent extends Component {
    @property({ type: Enum(CarTypes) })
    carType: CarTypes = CarTypes.Bus
    @property({ type: Enum(CarDir) })
    carDir: CarDir = CarDir.TOP
    @property({ type: Enum(CarColors) })
    get carColor() {
        return this._carColor
    }
    set carColor(value) {
        this._carColor = value
        this.changeColor()
    }
    @property({ type: Enum(CarColors) })
    private _carColor: CarColors = CarColors.Purple

    @property(({ type: CCFloat, displayName: '可承载人数' }))
    roleMax: number = 4;

    halfLen: number = 2

    roleNum: number = 0
    isFull: boolean = false

    onLoad() {
        this.changeColor()
        if (this.carType === CarTypes.Minivan) {
            this.halfLen = 1.6
        } else if (this.carType === CarTypes.Sedan) {
            this.halfLen = 1.4
        }

        this.roleNum = 0
        this.isFull = false
    }

    protected start(): void {
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
    }

    onTouchStart(event: EventTouch) {
        EventDispatcher.instance.emit(GameEvent.EVENT_CLICK_CAR, this.node)
    }

    changeColor() {
        this.node.getChildByName("Color").children.forEach(child => {
            if (child.name === CarColors[this._carColor]) {
                child.active = true
            } else {
                child.active = false
            }
        })

        this.node.getChildByName("Cover").children.forEach(child => {
            if (child.name === CarColors[this._carColor]) {
                child.active = true
            } else {
                child.active = false
            }
        })

        this.node.getChildByName("Cover").active = true

        tween(this.node)
            .to(0.2, { scale: new Vec3(1.4, 1.4, 1.4) })
            .to(0.2, { scale: new Vec3(0.95, 0.95, 0.95) })
            .start()
    }

    /** 添加人到车位上*/
    addRole(role: Node): boolean {
        const carPoint = this.node.parent
        role.active = true;
        role.setParent(this.node.getChildByName("Seets").children[this.roleNum]);
        tween(role).to(0.2, {
            position: new Vec3(0, 0, 0)
        }).call(() => {
            role.setScale(0.9, 0.9, 0.9)
            role.setRotationFromEuler(0, 0, 0)
            if (this.isFull) {
                carPoint.name = "empty"
                this.carOutTween(carPoint)
            }

            role.getComponent(CircleCollider2D)!.sensor = true;
            EventDispatcher.instance.emit(GameEvent.EVENT_CHECK_ELEMENT_CHILDREN);
        })
            .start()

        this.roleNum += 1
        if (this.carType === CarTypes.Minivan) {
            this.isFull = this.roleNum > 5
        } else if (this.carType === CarTypes.Sedan) {
            this.isFull = this.roleNum > 3
        } else if (this.carType === CarTypes.Bus) {
            this.isFull = this.roleNum > 7
        } else if (this.carType === CarTypes.Single) {
            this.isFull = this.roleNum > 0
        }

        return this.isFull
    }

    //打开车盖
    openCover() {
        const cover = this.node.getChildByName("Cover")!;
        cover.active = true
        const scale = cover.scale;
        tween(cover).to(0.1, { scale: new Vec3(0, scale.y, scale.z) }, {
            easing: "quadOut"
        }).start()
    }

    carOut() {
        this.node.getChildByName("Seets").children.forEach(seat => {
            if (seat.children.length === 0) return
        })
        CarColorsGlobalInstance.instance.carSysterm.removeCar(this.node);
        this.node.removeFromParent()
        this.node.destroy()

        if (CarColorsGlobalInstance.instance.carSysterm.activeCar.size === 0) {
            const children = CarColorsGlobalInstance.instance.levels.children;
            const levelComp = children[0].getComponent(LevelAction)!;
            const pins = levelComp.get_pin_color();
            if (pins.length == 0) {
                const ui = tgxUIMgr.inst.getUI(UI_BattleResult)!;
                if (!ui) {
                    LevelManager.instance.levelModel.isWin = true;
                    tgxUIMgr.inst.showUI(UI_BattleResult);
                }
            }
        }
    }

    //剩余车位
    getRemainSeat() {
        let max = 0;
        switch (this.carType) {
            case CarTypes.Minivan:
                max = 6;
                break;
            case CarTypes.Sedan:
                max = 4;
                break;
            case CarTypes.Bus:
                max = 8;
                break;
            case CarTypes.Single:
                max = 1;
                break;
            default:
                throw new Error(`Unknown car type: ${this.carType}`);
        }

        return max - this.roleNum;
    }

    protected onDestroy(): void {
        this.node.off(Input.EventType.TOUCH_START, this.onTouchStart)
    }

    // 车离开
    carOutTween(target: Node) {
        const rightPointPos = find("Canvas/Scene/Grounds/PhysicRoodTop/RightPoint")!.getWorldPosition();
        tween(this.node).to(0.2, {
            worldPosition: target.getWorldPosition()
        })
            .call(() => {
                const targetV3 = new Vec3(rightPointPos.x, rightPointPos.y, 0);
                const up = new Vec3(0, 0, -1);
                this.node.lookAt(targetV3, up);
            })
            .delay(0.1)
            .to(0.2, {
                worldPosition: rightPointPos
            })
            .call(() => {
                this.carOut()
            })
            .start()
    }

    //检测前方是否有碰撞物
    checkCollision(): boolean {
        const objs = GameUtil.getWorldPositionAsVec2(this.node);
        const obje = GameUtil.calculateRayEnd(this.node, 1000);

        // 射线检测
        let results = PhysicsSystem2D.instance.raycast(objs, obje, ERaycast2DType.Closest);
        if (results.length > 0) {
            const collider = results[0].collider;
            //碰到车
            if (collider.group == 1 << 1) {
                return true
            }
        }

        return false
    }

    // createRaycastPosByDir(objs: Vec2, carDir: CarDir): Vec2 {
    //     if (carDir == CarDir.TOP) {
    //         return new Vec2(objs.x, objs.y + 1000);
    //     } else if (carDir == CarDir.BOTTOM) {
    //         return new Vec2(objs.x, objs.y - 1000);
    //     } else if (carDir == CarDir.LEFT) {
    //         return new Vec2(objs.x - 1000, objs.y);
    //     } else if (carDir == CarDir.RIGHT) {
    //         return new Vec2(objs.x + 1000, objs.y);
    //     }
    // }
}


