import { _decorator, Component, Node } from 'cc';
import { CarCarColorsSysterm } from './Systems/CarCarColorsSysterm';

const { ccclass, property } = _decorator;

@ccclass('CarColorsGlobalInstance')
export class CarColorsGlobalInstance extends Component {
    private static _instance: CarColorsGlobalInstance;
    public static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new CarColorsGlobalInstance();
        return this._instance;
    }

    public levels: Node = null;
    public carSysterm: CarCarColorsSysterm = null;
}


