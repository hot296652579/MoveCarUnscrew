import { isValid, Label, tween, v3, Vec3, Node, Tween } from "cc";
import { EventDispatcher } from "../../../../core_tgx/easy_ui_framework/EventDispatcher";
import { tgxModuleContext } from "../../../../core_tgx/tgx";
import { GameUILayers } from "../../../../scripts/GameUILayers";
import { UI_BattleResult } from "../../../../scripts/UIDef";
import { Layout_BattleResult } from "./Layout_BattleResult";
import { GtagMgr, GtagType } from "db://assets/core_tgx/base/GtagMgr";

export class UI_BattleResult_Impl extends UI_BattleResult {
    rewardBase: number = 0; //基础奖励
    rewardAdditional: number = 0; //额外奖励
    timeoutIds: Array<number | NodeJS.Timeout> = [];
    win: boolean = true;

    constructor() {
        super('Prefabs/UI/Result/UI_BattleResult', GameUILayers.POPUP, Layout_BattleResult);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        const soundId = this.win ? 3 : 3;
    }
}

tgxModuleContext.attachImplClass(UI_BattleResult, UI_BattleResult_Impl);