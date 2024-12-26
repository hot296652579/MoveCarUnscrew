import { _decorator, CCInteger, Component, find, Node, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CarBoxComponent')
export class CarBoxComponent extends Component {
    @property(CCInteger)
    get num() {
        return this._num
    }
    set num(value) {
        this._num = value
    }
    @property(CCInteger)
    private _num: number = 8

    isAnimateOut: boolean = false

    /** 盒子出车*/
    outCarTween() {
        console.log("outCarTween")
        this.isAnimateOut = true

        const car = this.node.getChildByName("cars").children[0]
        car.setPosition(0, -2, 4)
        car.forward = this.node.forward.clone().multiplyScalar(-1)
        car.setParent(find("Scene/Levels").children[0], true)
        this.num -= 1
        const wpos = car.getWorldPosition()
        wpos.add(this.node.forward.clone().multiplyScalar(7))
        wpos.y = 0.1
        tween(car).to(0.5, {
            worldPosition: wpos
        })
            .call(() => {
                this.isAnimateOut = false
            })
            .start()
    }
}


