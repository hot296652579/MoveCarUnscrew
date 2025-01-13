import { _decorator, Component, Node, tween, Tween, Vec3, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Barricade')
export class Barricade extends Component {

    originPosition: Vec3 = new Vec3();

    start() {
        this.originPosition = this.node.getWorldPosition().clone();
    }

    //踢飞到屏幕外
    tick() {
        const size = view.getVisibleSize();
        Tween.stopAllByTarget(this.node);
        tween(this.node)
            .to(0.5, { worldPosition: new Vec3(size.width, this.node.worldPosition.y + 200, 0), angle: Math.random() * 1 > 0.5 ? 360 : -360 })
            .call(() => {
                this.node.active = false;
                this.node.angle = 0;
                this.node.setWorldPosition(this.originPosition);
            })
            .start();
    }
}


