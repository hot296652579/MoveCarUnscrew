import { JsonUtil } from "db://assets/core_tgx/base/utils/JsonUtil";
import { Tablelevels_config } from "../../../module_basic/table/Tablelevels_config";
import { Tablemain_config } from "../../../module_basic/table/Tablemain_config";
import { GlobalConfig } from "../../../start/Config/GlobalConfig";
import { sys } from "cc";
import { CarCarColorsSysterm } from "../Systems/CarCarColorsSysterm";
import { CarColorsGlobalInstance } from "../CarColorsGlobalInstance";

/**道具类型
 * @param REVOKE 撤销
 * @param ADDNUT 增加螺丝
*/
export enum TYPE_ITEM {
    REVOKE = 1,
    ADDNUT = 2,
}

export enum TYPE_GAME_STATE {
    GAME_STATE_INIT = 0, //准备阶段
    GAME_STATE_START = 1, //开始
    GAME_STATE_END = 2, //结束(倒计时结束)
    GAME_STATE_RESULT = 3, //结算
    GAME_STATE_PAUSE = 4, //暂停
}

/**关卡数据模型
 */
export class LevelModel {
    public levelConfig: Tablelevels_config;

    /** 当前关卡等级*/
    public level: number = 1;
    /** 每关星星结算*/
    public star: number = 3;
    /** 储存每关星星结算*/
    public levelStarsMap: Map<number, number> = new Map<number, number>();
    /** 保存可随机的关卡*/
    public randomLevelList: number[] = [];
    /** 输赢*/
    public isWin: boolean = false;

    /** 当前游戏状态*/
    public curGameState: TYPE_GAME_STATE = TYPE_GAME_STATE.GAME_STATE_INIT;

    constructor() {
        this.levelConfig = new Tablelevels_config();

        const isDebug = GlobalConfig.isDebug;
        if (isDebug) {
            this.level = GlobalConfig.initilizeLevel;
        } else {
            const level = sys.localStorage.getItem('level');
            this.level = level ? parseInt(level) : 1;
        };
        this.levelConfig.init(this.level);
    }

    /** 可随机的关卡合集*/
    getRandomLevelList() {
        const table = JsonUtil.get(Tablelevels_config.TableName);
        if (!table) {
            console.warn('Get level table is fail!');
        }
        this.randomLevelList = Object.values(table).filter(item => item['random'] == 1)
            .map(item => item['level']);
    }

    /** 清除关卡数据*/
    clearLevel() {
        CarColorsGlobalInstance.instance.carSysterm.clearAll();
        this.isWin = false;
        this.star = 3;
    }

}