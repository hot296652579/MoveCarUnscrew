import { _decorator, CircleCollider2D, Component, Enum, EventTouch, find, Input, Node, tween, Vec3 } from 'cc';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { tgxUIMgr } from 'db://assets/core_tgx/tgx';
import { UI_BattleResult } from 'db://assets/scripts/UIDef';
import { CarColorsGlobalInstance } from '../CarColorsGlobalInstance';
import { CarColors, CarDir, CarTypes } from '../CarColorsGlobalTypes';
import { GameEvent } from '../Enum/GameEvent';
import { LevelAction } from '../LevelAction';
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

    halfLen: number = 2

    roleNum: number = 0
    isFull: boolean = false

    tweenCount = 0
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

        this.node.getChildByName("arrow").active = true

        tween(this.node)
            .to(0.2, { scale: new Vec3(1.4, 1.4, 1.4) })
            .to(0.2, { scale: new Vec3(0.95, 0.95, 0.95) })
            .start()
    }

    /** 添加人到车位上*/
    addRole(role: Node): boolean {
        const carPoint = this.node.parent
        role.setParent(this.node.getChildByName("Seets").children[this.roleNum]);
        tween(role).to(0.2, {
            position: new Vec3(0, 0, 0)
        }).call(() => {
            this.tweenCount -= 1
            role.setScale(0.9, 0.9, 0.9)
            role.setRotationFromEuler(0, 0, 0)
            if (this.tweenCount <= 0 && this.isFull) {
                if (carPoint.getSiblingIndex() === 7) {
                    carPoint.name = "lock"
                    carPoint.children[0].children[0].active = false
                    carPoint.children[0].children[1].active = true
                } else {
                    carPoint.name = "empty"
                }
                this.carOutTween(carPoint)
            }

            role.getComponent(CircleCollider2D)!.sensor = true;
            EventDispatcher.instance.emit(GameEvent.EVENT_CHECK_ELEMENT_CHILDREN);
        })
            .start()

        this.tweenCount += 1
        this.roleNum += 1
        if (this.carType === CarTypes.Minivan) {
            this.isFull = this.roleNum > 5
        } else if (this.carType === CarTypes.Sedan) {
            this.isFull = this.roleNum > 3
        } else if (this.carType === CarTypes.Bus) {
            this.isFull = this.roleNum > 9
        } else if (this.carType === CarTypes.Single) {
            this.isFull = this.roleNum > 0
        }

        return this.isFull
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
                tgxUIMgr.inst.showUI(UI_BattleResult);
            }
        }
    }

    protected onDestroy(): void {
        this.node.off(Input.EventType.TOUCH_START, this.onTouchStart)
    }

    // 车离开
    carOutTween(target: Node) {
        tween(this.node).to(0.2, {
            worldPosition: target.getWorldPosition()
        })
            .call(() => {
                const carforward = this.node.forward.clone()
                tween(carforward).to(0.1, { x: -1, y: 0, z: 0 }, {
                    onUpdate: () => {
                        this.node.forward = carforward
                    }
                }).start()
            })
            .delay(0.1)
            .to(0.2, {
                worldPosition: find("Canvas/Scene/Grounds/PhysicRoodTop/RightPoint").getWorldPosition()
            })
            .call(() => {
                this.carOut()
            })
            .start()
    }
}


