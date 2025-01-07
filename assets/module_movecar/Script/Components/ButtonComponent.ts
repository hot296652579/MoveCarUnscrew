import { Button, Component, Label, Node, NodeEventType, _decorator, find } from 'cc';
import { GameEvent } from '../Enum/GameEvent';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { TYPE_ITEM } from '../CarColorsGlobalTypes';
const { ccclass, property } = _decorator;

/**
 * 底部按钮控制器
 */
@ccclass('ButtonComponent')
export class ButtonComponent extends Component {
    @property(Button) btRefresh: Button = null!;
    @property(Button) btMagnet: Button = null!;

    protected start(): void {
        this.addUIEvent()
    }

    private addUIEvent(): void {
        this.btRefresh.node.on(NodeEventType.TOUCH_END, () => this.onClickHandler(TYPE_ITEM.REFRESH), this);
        this.btMagnet.node.on(NodeEventType.TOUCH_END, () => this.onClickHandler(TYPE_ITEM.MAGNET), this);
    }

    private onClickHandler(type: TYPE_ITEM): void {
        if (type == TYPE_ITEM.REFRESH) {
            EventDispatcher.instance.emit(GameEvent.EVENT_REFRESH_COLOR);
        } else if (type == TYPE_ITEM.MAGNET) {
            EventDispatcher.instance.emit(GameEvent.EVENT_MAGNET);
        }
    }

}
