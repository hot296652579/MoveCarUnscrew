export class GameEvent {
    /** 通知UI实例化*/
    static readonly EVENT_UI_INITILIZE = 'EVENT_UI_INITILIZE';
    /** 游戏开始*/
    static readonly EVENT_GAME_START = 'EVENT_GAME_START';

    /** 点击汽车*/
    static readonly EVENT_CLICK_CAR = 'EVENT_CLICK_CAR';

    /** 更新Layer*/
    static readonly EVENT_UPDATE_LAYER = 'EVENT_UPDATE_LAYER';

    /** 刷新剩余钉子数量*/
    static readonly EVENT_UPDATE_LEFT_NAIL = 'EVENT_UPDATE_LEFT_NAIL';

    /** 检测是否有钉子可上车*/
    static readonly EVENT_CHECK_MOVE_TO_CAR = 'EVENT_CHECK_MOVE_TO_CAR';

    /** 检测element子节点长度*/
    static readonly EVENT_CHECK_ELEMENT_CHILDREN = 'EVENT_CHECK_ELEMENT_CHILDREN';

    /** 磁力事件*/
    static readonly EVENT_MAGNET = 'EVENT_MAGNET';

    /** 颜色刷新事件*/
    static readonly EVENT_REFRESH_COLOR = 'EVENT_REFRESH_COLOR';

    /** 检测游戏是否结束*/
    static readonly EVENT_CHECK_GAME_OVER = 'EVENT_CHECK_GAME_OVER';

    /** 闯关成功 关卡升级*/
    static readonly EVENT_BATTLE_SUCCESS_LEVEL_UP = 'EVENT_BATTLE_SUCCESS_LEVEL_UP';

    /** 闯关失败 关卡重载*/
    static readonly EVENT_BATTLE_FAIL_LEVEL_RESET = 'EVENT_BATTLE_FAIL_LEVEL_RESET';
}