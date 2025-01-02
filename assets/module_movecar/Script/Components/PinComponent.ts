/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2025-01-01 09:28:17
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2025-01-02 23:03:50
 * @FilePath: /MoveCarUnscrew/assets/module_movecar/Script/Components/PinComponent.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { _decorator, BoxCollider2D, CircleCollider2D, Collider2D, Color, Component, Contact2DType, Input, IPhysics2DContact, PhysicsSystem2D, PolygonCollider2D, RigidBody2D, Sprite } from 'cc';
import { CarColorHex, CarColors } from '../CarColorsGlobalTypes';
import { HoleComponent } from './HoleComponent';
const { ccclass, property } = _decorator;

/** 钉子组件*/
@ccclass('PinComponent')
export class PinComponent extends Component {
    pin_color: CarColors = null;
    @property({ type: Sprite })
    pin_img: Sprite

    pos_hole: HoleComponent = null;

    canFlying: boolean = true;
    flying: boolean = false;

    start() {
        const physicsSystem = PhysicsSystem2D.instance;
        let collider = this.getComponent(Collider2D);

        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        //被其他物体挡住禁止飞行
        // console.log('selfCollider.node.name:', selfCollider.node.name, 'otherCollider.node.name:', otherCollider.node.name);
        // console.log('selfCollider.node.parent:', selfCollider.node.parent, 'otherCollider.node.parent:', otherCollider.node.parent);
        // if (otherCollider.node) {
        //     if (selfCollider.node.parent !== otherCollider.node.parent) {
        //         console.log(`被挡住的钉子颜色:${this.pin_color} otherCollider节点:${otherCollider.node.name} other.parent:${otherCollider.node.parent.name}`);
        //     }
        // }

        // console.log(otherCollider.node.getSiblingIndex());
        console.log('this.pin_color:', this.pin_color);
        console.log(this.node.parent.name);
        console.log('otherCollider.node.name:', otherCollider.node.name);
        if (this.node.parent !== otherCollider.node) {
            console.log('asdfsafa')
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体结束接触时被调用一次

    }

    public is_flying(): boolean {
        return this.flying;
    }

    public set_flyinng(f: boolean) {
        this.flying = f;
    }

    public init_date(group_id: number, pin_color: CarColors, hole: HoleComponent) {
        this.pos_hole = hole;
        this.node.getComponent(RigidBody2D).group = group_id;
        this.node.getComponents(BoxCollider2D).forEach(element => {
            element.group = group_id;
        });
        this.node.getComponents(CircleCollider2D).forEach(element => {
            element.group = group_id;
        });
        this.node.getComponents(PolygonCollider2D).forEach(element => {
            element.group = group_id;
        });
        this.pin_color = pin_color;
        //set color
        this.reset_img();
    }

    public remove_collider() {
        this.node.getComponent(RigidBody2D).enabled = false;
        this.node.getComponent(CircleCollider2D).enabled = false;
        this.node.off(Input.EventType.TOUCH_START);
    }

    reset_img() {
        if (!this.pin_color) {
            return;
        }

        this.pin_img.getComponent(Sprite).color = new Color().fromHEX(CarColorHex[this.pin_color]);
    }

}

