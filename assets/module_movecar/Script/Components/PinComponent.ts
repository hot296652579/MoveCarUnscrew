import { _decorator, BoxCollider2D, CCBoolean, CircleCollider2D, Collider2D, Color, Node, Component, Contact2DType, Input, IPhysics2DContact, PhysicsSystem2D, PolygonCollider2D, RigidBody2D, Sprite, Rect } from 'cc';
import { CarColorHex, CarColors } from '../CarColorsGlobalTypes';
import { HoleComponent } from './HoleComponent';
import { LayerAction } from '../LayerAction';
import { UnitAction } from '../UnitAction';
const { ccclass, property } = _decorator;

/** 钉子组件*/
@ccclass('PinComponent')
export class PinComponent extends Component {
    pin_color: CarColors = null;
    @property({ type: Sprite })
    pin_img: Sprite

    isBlocked: boolean = false;

    pos_hole: HoleComponent = null;

    start() {
        this.checkBlocking();
    }

    // 获取当前 pin 所属的 layer 节点
    private getParentLayer(node: Node): Node | null {
        let current = node.parent;
        while (current) {
            if (current.parent?.getComponent(UnitAction)) {
                return current;
            }
            current = current.parent!;
        }
        return null;
    }

    // 获取当前层以上的所有 layer
    private getHigherLayers(currentLayer: Node): Node[] {
        const unitNode = currentLayer.parent;
        if (!unitNode) return [];

        const layers = unitNode.children
            .filter((child) => child.name.startsWith('layer_'))
            .sort((a, b) => parseInt(a.name.split('_')[1]) - parseInt(b.name.split('_')[1]));

        const currentIndex = layers.indexOf(currentLayer);
        return layers.slice(currentIndex + 1); // 获取当前层以上的所有层
    }

    // 获取当前 pin 的包围盒
    private getWorldBoundingBox(): Rect | null {
        const collider = this.node.getComponent(CircleCollider2D);
        if (!collider) return null;

        const aabb = collider.worldAABB;
        return new Rect(aabb.xMin, aabb.yMin, aabb.width, aabb.height);
    }

    // 检查是否被遮挡
    private checkBlocking() {
        const pinBoundingBox = this.getWorldBoundingBox();
        if (!pinBoundingBox) return;

        // 获取当前 pin 所在的 layer
        const currentLayer = this.getParentLayer(this.node);
        if (!currentLayer) return;

        // 获取当前层以上的所有 layer
        const higherLayers = this.getHigherLayers(currentLayer);
        if (higherLayers.length === 0) return;

        // 遍历所有高层 layer 的碰撞组件，判断是否有相交
        this.isBlocked = higherLayers.some((layer) => {
            const colliders = layer.getComponentsInChildren(Collider2D);
            return colliders.some((collider) => {
                const otherBoundingBox = collider.worldAABB;
                return pinBoundingBox.intersects(new Rect(
                    otherBoundingBox.xMin,
                    otherBoundingBox.yMin,
                    otherBoundingBox.width,
                    otherBoundingBox.height
                ));
            });
        });

        if (this.isBlocked) {
            console.log(`pin_color:${this.pin_color} 被遮挡了`);
        } else {
            console.log('Pin 未被遮挡，可以移动');
        }
    }

    public init_date(group_id: number, pin_color: CarColors, hole: HoleComponent) {
        this.pos_hole = hole;
        this.node.getComponent(RigidBody2D).group = group_id;
        this.node.getComponents(BoxCollider2D).forEach(element => {
            element.group = group_id;
        });
        this.node.getComponents(CircleCollider2D).forEach(element => {
            element.group = group_id;
        });
        this.node.getComponents(PolygonCollider2D).forEach(element => {
            element.group = group_id;
        });
        this.pin_color = pin_color;
        //set color
        this.reset_img();
    }

    reset_img() {
        if (!this.pin_color) {
            console.log(`被return的颜色${this.pin_color}`);
            return;
        }

        this.pin_img.getComponent(Sprite).color = new Color().fromHEX(CarColorHex[this.pin_color]);
    }

    protected onDestroy(): void {

    }

}

