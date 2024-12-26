import { _decorator, Node, Prefab, instantiate, Component, sys, assetManager, find } from 'cc';
import { EventDispatcher } from 'db://assets/core_tgx/easy_ui_framework/EventDispatcher';
import { ResLoader, resLoader } from 'db://assets/core_tgx/base/ResLoader';
import { GlobalConfig } from './Config/GlobalConfig';
const { ccclass, property } = _decorator;

@ccclass('LevelManager')
export class LevelManager {
    private static _instance: LevelManager | null = null;
    public static get instance(): LevelManager {
        if (!this._instance) this._instance = new LevelManager();
        return this._instance;
    }

    currentLevel: Node = null!;
    randomLevel: number = 0;

    initilizeModel(): void {
        this.preloadLevel();
    }

    async loadAsyncLevel(level: number): Promise<Prefab> {
        return new Promise((resolve, reject) => {
            const bundle = assetManager.getBundle(resLoader.gameBundleName);
            if (!bundle) {
                console.error("module_nut is null!");
                reject();
            }

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
                // console.log(`Level:${i} 预加载完成!`);
            })
        }
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
