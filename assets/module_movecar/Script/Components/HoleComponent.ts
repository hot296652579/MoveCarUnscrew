import { _decorator, Component, Node } from 'cc';
import { CarColors } from '../CarColorsGlobalTypes';
const { ccclass, property } = _decorator;

@ccclass('HoleComponent')
export class HoleComponent extends Component {
    start() {

    }

    initHole(color: CarColors) {
        //DOTO 实例化钉子
    }
}


