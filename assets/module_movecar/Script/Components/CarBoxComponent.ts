import { _decorator, CCInteger, Component, find, Label, Node, tween, v2, v3 } from 'cc';
import { GameUtil } from '../GameUtil';
const { ccclass, property } = _decorator;

@ccclass('CarBoxComponent')
export class CarBoxComponent extends Component {

    @property(Label)
    label: Label = null

    @property(CCInteger)
    get num() {
        return this._num
    }
    set num(value) {
        this._num = value
        this.label.string = `${value}`
    }
    @property(CCInteger)
    private _num: number = 3

    isAnimateOut: boolean = false

    /** 盒子出车*/
    outCarTween() {
        console.log("outCarTween 盒子出车")

        this.isAnimateOut = true
        const car = this.node.getChildByName("cars").children[0]
        const rotation = car.angle;
        this.num -= 1

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

        const objs = GameUtil.getWorldPositionAsVec2(car);
        const obje = objs.add(direction.multiplyScalar(300));
        car.setParent(find("Canvas/Scene/Levels").children[0], true);

        tween(car)
            .to(0.2, { worldPosition: v3(obje.x, obje.y, 0) })
            .call(() => {
                this.isAnimateOut = false
            })
            .start();
    }
}


