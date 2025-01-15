/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2025-01-01 11:20:01
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2025-01-01 18:51:22
 * @FilePath: /MoveCarUnscrew/assets/module_movecar/Script/Model/DataModel.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { _decorator } from 'cc';
import { CarColors } from '../CarColorsGlobalTypes';
const { ccclass, property } = _decorator;

@ccclass('DataModel')
export class DataModel {

    private static lvl_color_arr = [];


    public static reset_lvl_color_index() {
        DataModel.lvl_color_index = 0;
    }

    private static lvl_color_index: number = 0;
    public static get_lvl_color(): CarColors {
        let ret = DataModel.lvl_color_arr[DataModel.lvl_color_index];
        DataModel.lvl_color_index += 1;
        if (DataModel.lvl_color_index >= DataModel.lvl_color_arr.length) {
            DataModel.lvl_color_index = 0;
        }
        return ret;
    }

    // group_index_arr = [];
    private static cur_group_index = 3;

    public static get_new_group_index() {
        let temp = 1 << DataModel.cur_group_index;
        DataModel.cur_group_index += 1;
        if (DataModel.cur_group_index > 31) {
            DataModel.cur_group_index = 3;
        }
        // console.log("group:::::", temp);
        return temp;
    }
}

