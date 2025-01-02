/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2024-06-25 03:35:50
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2025-01-01 18:24:48
 * @FilePath: /MoveCarUnscrew/assets/module_movecar/Script/LayerAction.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { _decorator, Component } from 'cc';

import { CarColors } from './CarColorsGlobalTypes';
import { PinComponent } from './Components/PinComponent';
import { ElementAction } from './ElementAction';
import { DataModel } from './Model/DataModel';

const { ccclass, property } = _decorator;

@ccclass('LayerAction')
export class LayerAction extends Component {
    layer_group_id = 0;
    layer_color: CarColors = null;
    start() {
    }

    update(deltaTime: number) {
    }

    public get_hole_num(): number {
        let hole_num: number = 0;
        this.node.children.forEach(element_node => {
            hole_num += element_node.getComponent(ElementAction).get_hole_num();
        });
        return hole_num;
    }

    public init_layer() {
        this.layer_group_id = DataModel.get_new_group_index();

        this.node.children.forEach(element_node => {
            element_node.getComponent(ElementAction).init_element(this.layer_group_id, this.layer_color);
        });
    }

    public init_pin(color_pin_arr: CarColors[]) {
        this.node.children.forEach(element_node => {
            element_node.getComponent(ElementAction).init_pin(this.layer_group_id, color_pin_arr);
        });
    }

    get_pin_color(arr: PinComponent[]) {
        this.node.children.forEach(element_node => {
            element_node.getComponent(ElementAction)?.get_pin_color(arr);
        });
    }

    public get_element_num(): number {
        return this.node.children.length;
    }

    layer_status: number = 0;//1 = 
    public set_status(args: number) {  //0 =隐藏，1=显示,2=黑色模式
        switch (args) {
            case 0:
                this.node.active = false;
                break;
            case 1:
                this.node.active = true;
                if (this.layer_status == 0) {
                    this.node.children.forEach(element_node => {
                        element_node.getComponent(ElementAction)?.flash_img();
                    });
                }
                if (this.layer_status == 2) {
                    this.node.children.forEach(element_node => {
                        element_node.getComponent(ElementAction)?.set_layer_bg_or_orgin(false);
                        element_node.getComponent(ElementAction)?.flash_img();
                    });
                }

                break;
            case 2:
                if (this.layer_status != 2) {
                    this.node.children.forEach(element_node => {
                        element_node.getComponent(ElementAction)?.set_layer_bg_or_orgin(true);
                    });
                    this.scheduleOnce(() => {
                        this.node.active = true;
                        this.node.children.forEach(element_node => {
                            element_node.getComponent(ElementAction)?.flash_img(0.5);
                        });
                    }, 1.6);
                }
                break;
        }
        this.layer_status = args;
    }

}

