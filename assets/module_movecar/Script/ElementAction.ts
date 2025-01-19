import { _decorator, BoxCollider2D, CircleCollider2D, Color, Component, ERigidBody2DType, instantiate, PolygonCollider2D, RigidBody2D, Sprite, tween, UIOpacity, view, Node, isValid } from 'cc';
import { EventDispatcher } from '../../core_tgx/easy_ui_framework/EventDispatcher';
import { CarColorHex, CarColors } from './CarColorsGlobalTypes';
import { HoleComponent } from './Components/HoleComponent';
import { PinComponent } from './Components/PinComponent';
import { GameEvent } from './Enum/GameEvent';
import { ResourcePool } from './ResourcePool';

const { ccclass, property } = _decorator;

@ccclass('ElementAction')
export class ElementAction extends Component {
    ele_color: CarColors
    start() {
        EventDispatcher.instance.on(GameEvent.EVENT_CHECK_ELEMENT_CHILDREN, this.checkElementChildren, this);
    }

    update(deltaTime: number) {
        let currentPosition = this.node.getPosition().clone();
        if (currentPosition.y < - view.getVisibleSize().height) {
            this.removeElement();
        }
    }

    removeElement() {
        if (isValid(this.node)) {
            this.node.removeFromParent();
            this.node.destroy();
            EventDispatcher.instance.emit(GameEvent.EVENT_UPDATE_LAYER);
        }
    }

    //检测没有钉子 就变成传感器
    public checkElementChildren() {
        if (!this.node) return;


        const pins = this.node.getComponentsInChildren(PinComponent)!;
        // console.log('检测是否还有钉子:', pins.length)
        if (pins.length == 0) {
            console.log("没有钉子 Element刚体变成动力学");
            this.node.getComponent(RigidBody2D).type = ERigidBody2DType.Dynamic;
        }
    }

    public get_hole_num(): number {
        let hole_num: number = 0;
        this.node.children.forEach(element => {
            if (element.getComponent(HoleComponent)) {
                hole_num++;
            }
        });
        return hole_num;
    }

    public init_element(group_id: number, ele_color: CarColors) {
        this.ele_color = ele_color;
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
        //set img color
    }

    public init_pin(group_id: number, color_pin_arr: CarColors[]) {
        //获取 hole
        this.node.children.forEach(element => {
            if (element.getComponent(HoleComponent)) {
                // let new_pin = instantiate(ResourcePool.instance.get_prefab("pin"));
                // this.node.addChild(new_pin);
                // new_pin.setPosition(element.position);
                // new_pin.getComponent(PinComponent).init_date(group_id, color_pin_arr.shift(), element.getComponent(HoleComponent));

                const pin = element.getComponentInChildren(PinComponent)!;
                if (pin) {
                    pin.init_date(group_id, color_pin_arr.shift(), element.getComponent(HoleComponent));
                }
            }
        });
    }

    get_pin_color(arr: PinComponent[]) {
        this.node.children.forEach(pin_node => {
            // pin_node.getComponent(PinComponent)?.get_pin_color(arr);
            let pin_action = pin_node.getComponent(PinComponent)
            if (pin_action && pin_action.pin_color) {
                arr.push(pin_node.getComponent(PinComponent));
            }
        });
    }

    public flash_img(t: number = 0.3) {
        this.node.children.forEach(element => {
            if (element.name == "img") {
                if (element.getComponent(UIOpacity)) {
                    let t: number = 0.3
                    let opc_1 = 100;
                    let opc_2 = 200;
                    element.getComponent(UIOpacity).opacity = 255;
                    tween(element.getComponent(UIOpacity))
                        .to(t, { opacity: opc_2 }, { easing: 'quadInOut' })
                        .to(t, { opacity: opc_1 }, { easing: 'quadInOut' })
                        .to(t, { opacity: opc_2 }, { easing: 'quadInOut' })
                        .to(t, { opacity: opc_1 }, { easing: 'quadInOut' })
                        .to(t, { opacity: 255 }, { easing: 'quadInOut' })
                        .call(() => {
                            element.getComponent(UIOpacity).opacity = 255;
                        })
                    // .start();
                }
            }
        });
    }

    private set_img_color(_color: CarColors, a: number) {
        this.node.children.forEach(element => {
            if (element.name == "img" && _color) {
                let img = element.getComponent(Sprite);
                img.color = new Color().fromHEX(CarColorHex[_color]);
            }
        });
    }

    // this this layer is black color,but don't show pin for shows
    public set_layer_bg_or_orgin(is_bg: boolean) {
        if (is_bg) {
            this.node.getComponent(RigidBody2D).type = ERigidBody2DType.Static;
            this.node.children.forEach(element => {
                //默认都不显示
                element.active = false;
                if (element.name == "img") {
                    element.active = true;
                    //只设置图片颜色
                    this.set_img_color(CarColors.Black, 180);
                }
            });
        } else {
            this.node.children.forEach(element => {
                //默认都不显示
                element.active = true;
            });
            this.set_img_color(CarColors.SpriteWhite, 190);
            this.node.getComponent(RigidBody2D).type = ERigidBody2DType.Dynamic;
        }
    }

    protected onDestroy(): void {
        EventDispatcher.instance.off(GameEvent.EVENT_CHECK_ELEMENT_CHILDREN, this.checkElementChildren);
    }
}

