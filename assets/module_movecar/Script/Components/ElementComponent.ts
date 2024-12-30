import { _decorator, BoxCollider2D, CircleCollider2D, Color, Component, director, ERigidBody2DType, instantiate, Material, Node, PolygonCollider2D, Prefab, Rect, RigidBody2D, Sprite, tween, UIOpacity, UIRenderer, UITransform, Vec4, view } from 'cc';
import { CarColors } from '../CarColorsGlobalTypes';
const { ccclass, property } = _decorator;

@ccclass('ElementAction')
export class ElementAction extends Component {
    ele_color: CarColors
    start() {
    }

    update(deltaTime: number) {
        let currentPosition = this.node.getPosition()
        if (currentPosition.y < - view.getVisibleSize().height / 2) {
            this.node.removeFromParent();
        }
    }

    private set_img_color(_color: CarColors, a: number) {

    }

}

