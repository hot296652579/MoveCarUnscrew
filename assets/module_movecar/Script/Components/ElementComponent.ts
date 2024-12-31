import { _decorator, BoxCollider2D, CircleCollider2D, Color, Component, director, ERigidBody2DType, instantiate, isValid, Material, Node, PolygonCollider2D, Prefab, Rect, RigidBody2D, Sprite, tween, UIOpacity, UIRenderer, UITransform, Vec4, view } from 'cc';
import { CarColors } from '../CarColorsGlobalTypes';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { GameEvent } from '../Enum/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('ElementComponent')
export class ElementComponent extends Component {
    ele_color: CarColors
    start() {
    }

    update(deltaTime: number) {
        let currentPosition = this.node.getPosition();
        if (currentPosition.y < - view.getVisibleSize().height / 2) {
            if (isValid(this.node)) {
                this.node.removeFromParent();
                this.node.destroy();
                EventDispatcher.instance.emit(GameEvent.EVENT_UPDATE_LAYER);
            }
        }
    }

    private set_img_color(_color: CarColors, a: number) {

    }

}

