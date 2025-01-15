interface RoosterMoveCar {
    // 声音控制
    SoundMr: {
        pauseAll(): void;
        resumeAll(): void;
    };
    // 广告开关
    TargetedAds: {
        open(): void;
        clos(): void;
    };
    //Fps设置
    Fps: {
        setfps(value: number): void;
    };
}

declare interface Window {
    __woso: RoosterMoveCar;
}