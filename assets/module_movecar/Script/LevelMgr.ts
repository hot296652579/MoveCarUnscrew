import { _decorator, Node, Prefab, instantiate, Component, sys, assetManager, find } from 'cc';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { ResLoader, resLoader } from 'db://assets/core_tgx/base/ResLoader';
import { GlobalConfig } from './Config/GlobalConfig';
import { GameEvent } from './Enum/GameEvent';
import { LevelModel } from './Model/LevelModel';
import { CarColorsGlobalInstance } from './CarColorsGlobalInstance';
import { CarCarColorsComponent } from './Components/CarCarColorsComponent';
import { UnitColorsSysterm } from './Systems/UnitColorsSysterm';
const { ccclass, property } = _decorator;

@ccclass('LevelManager')
export class LevelManager {
    private static _instance: LevelManager | null = null;
    public static get instance(): LevelManager {
        if (!this._instance) this._instance = new LevelManager();
        return this._instance;
    }

    public levelModel: LevelModel = null;
    currentLevel: Node = null!;
    randomLevel: number = 0;

    initilizeModel(): void {
        this.levelModel = new LevelModel();

        this.preloadLevel();
        this.registerEvent();
    }

    private registerEvent(): void {
        EventDispatcher.instance.on(GameEvent.EVENT_BATTLE_SUCCESS_LEVEL_UP, this.levelUpHandler, this);
    }

    async loadAsyncLevel(level: number): Promise<Prefab> {
        return new Promise((resolve, reject) => {
            const bundle = assetManager.getBundle(resLoader.gameBundleName);
            if (!bundle) {
                console.error("module_nut is null!");
                reject();
            }

            console.log('加载的level:', level);
            resLoader.loadAsync(resLoader.gameBundleName, `Prefabs/CarColorsLevels/level${level}`, Prefab).then((prefab: Prefab) => {
                resolve(prefab);
            })
        })
    }

    /** 预加载关卡*/
    async preloadLevel() {
        const bundle = assetManager.getBundle(resLoader.gameBundleName);
        for (let i = 1; i <= GlobalConfig.levelTotal; i++) {
            bundle.preload(`Prefabs/Level/Level${i}`, Prefab, null, () => {
                console.log(`Level:${i} 预加载完成!`);
            })
        }
    }

    private async levelUpHandler() {
        this.clearLevelData();
        this.upgradeLevel();
        await this.gameStart();
    }

    public async gameStart() {
        const { level } = this.levelModel;
        const levelNode = await this.loadLevel(level);
        for (let i = 0; i < levelNode.children.length; i++) {
            const temp = levelNode.children[i];
            if (temp.getComponent(CarCarColorsComponent)) {
                CarColorsGlobalInstance.instance.carSysterm.addCar(levelNode.children[i]);
            }

            if (temp.getComponent(UnitColorsSysterm)) {
                temp.getComponent(UnitColorsSysterm).initLayer();
                temp.getComponent(UnitColorsSysterm).initPin();
            }
        }
    }

    /** 清除关卡数据*/
    clearLevelData(): void {
        this.levelModel.clearLevel();
    }

    upgradeLevel(up: number = 1): void {
        console.log('升级关卡', up);
        this.levelModel.level += up;
        console.log('this.levelModel.level:', this.levelModel.level);
    }

    async loadLevel(level: number): Promise<Node> {
        let levelPrefab = null;
        levelPrefab = await this.loadAsyncLevel(level);

        if (this.currentLevel) {
            this.currentLevel.destroy();
        }

        if (!levelPrefab) {
            console.log(`关卡预设不存在 level: ${level}.`)
            return;
        }

        this.currentLevel = instantiate(levelPrefab);
        find("Canvas/Scene/Levels").removeAllChildren();
        find("Canvas/Scene/Levels").addChild(this.currentLevel);
        return this.currentLevel;
    }
}
