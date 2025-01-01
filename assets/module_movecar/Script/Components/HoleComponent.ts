/*
 * @Author: super_javan 296652579@qq.com
 * @Date: 2024-12-30 21:08:27
 * @LastEditors: super_javan 296652579@qq.com
 * @LastEditTime: 2025-01-01 18:13:44
 * @FilePath: /MoveCarUnscrew/assets/module_movecar/Script/Components/HoleComponent.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { _decorator, Component, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HoleComponent')
export class HoleComponent extends Component {
    start() {

    }

    hide() {
        if (this.node.getComponent(UIOpacity)) {
            this.node.getComponent(UIOpacity).opacity = 0;
        }
    }
}


