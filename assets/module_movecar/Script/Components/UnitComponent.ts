import { _decorator, Component, Enum, Material, MeshRenderer, Node, Animation, randomRangeInt } from 'cc';
import { CarColors } from '../CarColorsGlobalTypes';
const { ccclass, property } = _decorator;


@ccclass('UnitComponent')
export class UnitComponent extends Component {
    @property({ type: Enum(CarColors) })
    get color() {
        return this._color
    }
    set color(value) {
        this._color = value
        this.changeColor()
    }

    @property({ type: Enum(CarColors) })
    private _color: CarColors = CarColors.Blue

    status: string = "" // sit, idle, run

    isHorizon: boolean = false

    isIntarget: boolean = false

    changeColor() {

    }
}


