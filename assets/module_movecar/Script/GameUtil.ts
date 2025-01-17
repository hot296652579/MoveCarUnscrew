import { Vec2, Node, v2, PolygonCollider2D, Rect, CircleCollider2D } from "cc";

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

    /**
     * 判断两个 AABB 是否相交
     */
    static isAABBIntersecting(rect1: Rect, rect2: Rect): boolean {
        return !(
            rect1.xMax < rect2.xMin ||
            rect1.xMin > rect2.xMax ||
            rect1.yMax < rect2.yMin ||
            rect1.yMin > rect2.yMax
        );
    }

    /**
     * 检查点是否在多边形内
     * @param point 点的坐标
     * @param polygonPoints 多边形的顶点数组
     * @returns 是否在多边形内
     */
    static isPointInPolygon(point: Vec2, polygonPoints: Readonly<Vec2[]>): boolean {
        let isInside = false;
        for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
            const xi = polygonPoints[i].x, yi = polygonPoints[i].y;
            const xj = polygonPoints[j].x, yj = polygonPoints[j].y;

            const intersect = (yi > point.y) !== (yj > point.y) &&
                point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
            if (intersect) isInside = !isInside;
        }
        return isInside;
    }

    /**
     * 检查圆是否与线段相交
     * @param circleCenter 圆心坐标
     * @param radius 圆的半径
     * @param lineStart 线段起点
     * @param lineEnd 线段终点
     * @returns 是否相交
     */
    static isCircleIntersectingLine(circleCenter: Vec2, radius: number, lineStart: Vec2, lineEnd: Vec2): boolean {
        const lineDir = lineEnd.subtract(lineStart);
        const toCircle = circleCenter.subtract(lineStart);
        const projection = toCircle.dot(lineDir.normalize());

        const closestPoint = lineStart.add(lineDir.normalize().multiplyScalar(projection));
        const distance = circleCenter.subtract(closestPoint).length();

        return distance <= radius;
    }

    /**
     * 获取圆形碰撞器的 AABB（轴对齐边界框）
     */
    static getCircleAABB(circleCollider: CircleCollider2D): Rect {
        const radius = circleCollider.radius;
        const center = circleCollider.worldPosition;

        const minX = center.x - radius;
        const minY = center.y - radius;
        const size = radius * 2;

        return new Rect(minX, minY, size, size);
    }

    /**
     * 获取多边形碰撞器的 AABB（轴对齐边界框）
     */
    static getPolygonAABB(polygonCollider: PolygonCollider2D): Rect {
        const points = polygonCollider.worldPoints;
        let minX = points[0].x;
        let maxX = points[0].x;
        let minY = points[0].y;
        let maxY = points[0].y;

        for (let i = 1; i < points.length; i++) {
            const p = points[i];
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }

        return new Rect(minX, minY, maxX - minX, maxY - minY);
    }

    /**
     * 判断多边形与圆是否相交
     * @param polygonCollider 多边形碰撞器
     * @param circleCollider 圆形碰撞器
     * @returns 是否相交
     */
    static isPolygonAndCircleIntersecting(
        polygonCollider: PolygonCollider2D,
        circleCollider: CircleCollider2D
    ): boolean {
        // 1. AABB 检测
        // const polygonAABB = this.getPolygonAABB(polygonCollider);
        // const circleAABB = this.getCircleAABB(circleCollider);

        // if (!this.isAABBIntersecting(polygonAABB, circleAABB)) {
        //     return false;
        // }

        // 2. 精确检测
        const circleCenter = new Vec2(circleCollider.node.worldPosition.x, circleCollider.node.worldPosition.y); // 圆心
        const radius = circleCollider.radius;

        // 检查圆心是否在多边形内部
        if (this.isPointInPolygon(circleCenter, polygonCollider.worldPoints)) {
            return true;
        }

        // 检查圆是否与多边形的边相交
        const points = polygonCollider.worldPoints;
        for (let i = 0; i < points.length; i++) {
            const start = points[i];
            const end = points[(i + 1) % points.length];
            if (this.isCircleIntersectingLine(circleCenter, radius, start, end)) {
                return true;
            }
        }

        return false;
    }

    static delay(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

}