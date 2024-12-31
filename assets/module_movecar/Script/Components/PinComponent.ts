import { _decorator, BoxCollider2D, CircleCollider2D, Color, Component, director, EventTouch, find, Input, instantiate, Node, PolygonCollider2D, Rect, RigidBody2D, Sprite, tween, UIOpacity, UITransform, Vec2, Vec3 } from 'cc';
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


    flying: boolean = false;

    start() {
        // this.node.on(Input.EventType.TOUCH_START, this.touch_start, this);
    }

    update(deltaTime: number) {

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

    touch_start(e: EventTouch) {
        this.node.destroy();
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

