import { Vec2, Node, v2 } from "cc";

/** 游戏工具类 */
export class GameUtil {

    /** 转换成hh:mm格式*/
    // static formatToTimeString(totalSeconds: number): string {
    //     const minutes = Math.floor(totalSeconds / 60);
    //     const seconds = totalSeconds % 60;
    //     const formattedMinutes = String(minutes).padStart(2, '0');
    //     const formattedSeconds = String(seconds).padStart(2, '0');
    //     return `${formattedMinutes}:${formattedSeconds}`;
    // }

    /** 重量单位转换*/
    static formatWeight(weight: number): string {
        if (weight < 1000) {
            return `${weight}KG`;
        }
        // 等于或超过1000时，转换为吨（T），保留两位小数并向下取整
        const inTons = Math.floor((weight / 1000) * 100) / 100;
        return `${inTons}T`;
    }

    /**
     * 将 16 进制颜色转换为 RGBA 格式
     * @param hex - 16 进制颜色字符串 (#FFE73A 或 FFE73A)
     * @param alpha - 可选的透明度值（范围 0~255，默认 255）
     * @returns Color - 包含 r, g, b, a 的对象
     */
    static hexToRGBA(hex: string, alpha: number = 255): { r: number; g: number; b: number; a: number } {
        // 去掉可能存在的 '#' 前缀
        hex = hex.replace(/^#/, '');

        // 如果是简写格式 (如 #F7A)，转换为完整格式 (FF77AA)
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        // 转换为 r, g, b
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // 返回 RGBA 颜色对象
        return { r, g, b, a: alpha };
    }

    /** 获取节点的世界坐标并转换为 Vec2*/
    static getWorldPositionAsVec2(node: Node): Vec2 {
        const worldPosition = node.getWorldPosition().clone(); // 获取世界坐标
        return v2(worldPosition.x, worldPosition.y); // 转换为 Vec2
    }

    /** 射线检测
     * @param fromNode 起始节点
     * @param rayLength 射线长度
     * @return 射线结束点的世界坐标 (作为 Vec2)
    */
    static calculateRayEnd(fromNode: Node, rayLength: number): Vec2 {
        const rotation = fromNode.angle;

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

        // 计算射线起点坐标
        const objs = this.getWorldPositionAsVec2(fromNode);
        const obje = objs.add(direction.multiplyScalar(rayLength));

        return obje;
    }

    static delay(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

}