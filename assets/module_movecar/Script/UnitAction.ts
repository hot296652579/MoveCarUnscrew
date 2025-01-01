/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2024-06-24 21:02:25
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2025-01-01 18:07:04
 * @FilePath: /MoveCarUnscrew/assets/module_movecar/Script/UnitAction.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { _decorator, Component } from 'cc';
import { CarColors } from './CarColorsGlobalTypes';
import { PinComponent } from './Components/PinComponent';
import { LayerAction } from './LayerAction';
const { ccclass, property } = _decorator;

@ccclass('UnitAction')
export class UnitAction extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    public init_layer() {
        this.node.children.forEach(layer_node => {
            layer_node.getComponent(LayerAction).init_layer();
        });
    }

    public init_pin(color_pin_arr: CarColors[]) {
        this.node.children.forEach(layer_node => {
            layer_node.getComponent(LayerAction).init_pin(color_pin_arr);
        });
    }

    // public init_hole() {
    //     this.node.children.forEach(layer_node => {
    //         layer_node.getComponent(LayerAction).init_hole();
    //     });
    // }

    get_pin_color(arr: PinComponent[]): PinComponent[] {
        for (let i = this.node.children.length - 1; i >= 0; i--) {
            let layer_action = this.node.children[i].getComponent(LayerAction);
            layer_action?.get_pin_color(arr);
        }
        return arr
    }

    get_layer(arr: LayerAction[]): LayerAction[] {
        //默认都是不显示的
        for (let i = this.node.children.length - 1; i >= 0; i--) {
            let layer_action = this.node.children[i].getComponent(LayerAction);
            if (layer_action) {
                arr.push(layer_action);
            }
        }
        return arr;
    }

    get_hole_num(): number {
        let hole_num: number = 0;
        this.node.children.forEach(layer_node => {
            let num = layer_node.getComponent(LayerAction).get_hole_num();
            hole_num += num;
        });
        return hole_num;
    }
}

