import { _decorator, Component } from 'cc';
import { CarColorsGlobalInstance } from './CarColorsGlobalInstance';
import { CarCarColorsComponent } from './Components/CarCarColorsComponent';
import { PinComponent } from './Components/PinComponent';
import { LayerAction } from './LayerAction';
import { UnitAction } from './UnitAction';
const { ccclass, property } = _decorator;

@ccclass('LevelAction')
export class LevelAction extends Component {

    start() {
        //DOTO 
        // director.on(events.remove_element, this.hide_element, this);
    }

    update(deltaTime: number) {
    }

    get_lvl(): number {
        let arr = this.node.name.split("_");
        // console.log("split get_lvl>>>>>:", arr);
        return Number(arr[1].trim());
    }

    get_hole_num(): number {
        let hole_num: number = 0;
        this.node.children.forEach(layer_node => {
            let num = layer_node.getComponent(UnitAction).get_hole_num();
            hole_num += num;
        });
        return hole_num;
    }

    public init_level() {
        for (let i = 0; i < this.node.children.length; i++) {
            const temp = this.node.children[i];
            if (temp.getComponent(CarCarColorsComponent)) {
                CarColorsGlobalInstance.instance.carSysterm.addCar(this.node.children[i]);
            }
        }

        this.node.children.forEach(unit_node => {
            if (unit_node.getComponent(UnitAction)) {
                unit_node.getComponent(UnitAction).init_layer();
            }
        });

        const color_pin_arr = CarColorsGlobalInstance.instance.carSysterm.carSeats;
        this.node.children.forEach(unit_node => {
            if (unit_node.getComponent(UnitAction)) {
                unit_node.getComponent(UnitAction)!.init_pin(color_pin_arr);
            }
        });

        //DOTO 初始化停车位

        //默认隐藏一些
        this.set_default_layer();
    }

    private set_default_layer() {
        //默认都是不显示的
        let layer_arr = this.get_all_layer();
        layer_arr.forEach(layer_action => {
            // layer_action.node.active = false;
            layer_action.set_status(0);
        });
        this.hide_element();
    }

    private get_all_layer(): LayerAction[] {
        let arr: LayerAction[] = [];
        //默认都是不显示的
        for (let i = this.node.children.length - 1; i >= 0; i--) {
            if (this.node.children[i].getComponent(UnitAction)) {
                let layer_action = this.node.children[i].getComponent(UnitAction);
                layer_action.get_layer(arr);
            }
        }
        return arr;
    }


    private async hide_element() {
        let default_show_layer_num = 4;
        let show_num = 0;
        let layer_arr = this.get_all_layer();
        for (let i = 0; i < layer_arr.length; i++) {
            let layer_action = layer_arr[i];
            if (layer_action.get_element_num() <= 0) {
                continue;
            }
            show_num++;
            if (show_num <= default_show_layer_num) {
                // layer_action.set_layer_bg_or_orgin(false);
                // layer_action.layer_active(true);
                layer_action.set_status(1);
            } else if (show_num == (default_show_layer_num + 1)) {
                // layer_action.set_layer_bg_or_orgin(true);
                layer_action.set_status(2);
            } else {
                // layer_action.layer_active(false);
                layer_action.set_status(0);
            }
        }
    }

    /** 返回顶部面板里的颜色钉子组件数组*/
    get_pin_color(): PinComponent[] {
        let arr: PinComponent[] = [];
        for (let i = this.node.children.length - 1; i >= 0; i--) {
            let unit_action = this.node.children[i].getComponent(UnitAction);
            unit_action?.get_pin_color(arr);
        }
        return arr
    }
}

