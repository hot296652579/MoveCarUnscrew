import { isValid, Label, tween, v3, Vec3, Node, Tween } from "cc";
import { EventDispatcher } from "../../../../core_tgx/easy_ui_framework/EventDispatcher";
import { tgxModuleContext } from "../../../../core_tgx/tgx";
import { GameUILayers } from "../../../../scripts/GameUILayers";
import { UI_BattleResult } from "../../../../scripts/UIDef";
import { Layout_BattleResult } from "./Layout_BattleResult";
import { GtagMgr, GtagType } from "db://assets/core_tgx/base/GtagMgr";
import { GameEvent } from "../../../Script/Enum/GameEvent";

export class UI_BattleResult_Impl extends UI_BattleResult {
    rewardBase: number = 0; //基础奖励
    rewardAdditional: number = 0; //额外奖励
    timeoutIds: Array<number> = [];
    win: boolean = true;

    constructor() {
        super('Prefabs/UI/Result/UI_BattleResult', GameUILayers.POPUP, Layout_BattleResult);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        const soundId = this.win ? 3 : 3;

        let layout = this.layout as Layout_BattleResult;
        this.onButtonEvent(layout.btNext, () => {
            this.onClickRewardBase(); //领取基础奖励
        });

        this.rotationLight();
    }

    private rotationLight(): void {
        const { light } = this.layout;
        light.eulerAngles = v3(0, 0, 0);
        tween(light)
            .repeatForever(
                tween()
                    .to(5, { eulerAngles: new Vec3(0, 0, 360) }, { easing: 'linear' })
                    .call(() => {
                        light!.eulerAngles = new Vec3(0, 0, 0);
                    })
            )
            .start();
    }

    private emitEvent(): void {
        if (this.win) {
            EventDispatcher.instance.emit(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP);
        } else {
            EventDispatcher.instance.emit(GameEvent.EVENT_BATTLE_FAIL_LEVEL_RESET);
        }
    }

    onClickRewardBase(): void {
        this.emitEvent();
        this.destoryMyself();
    }

    clearAllTimeouts() {
        this.timeoutIds.forEach((id) => clearTimeout(id));
        this.timeoutIds = [];
    }

    private destoryMyself(): void {
        Tween.stopAllByTarget(this.node)
        if (isValid(this.node)) {
            this.node.removeFromParent();
            this.node.destroy();
        }
        this.clearAllTimeouts();
    }

}

tgxModuleContext.attachImplClass(UI_BattleResult, UI_BattleResult_Impl);