export enum CarTypes {
    Sedan,
    Bus,
    Minivan,
}

export enum CarDir {
    TOP,
    BOTTOM,
    LEFT,
    RIGHT,
}

export enum CarColors {
    Blue,
    Green,
    Red,
    White,
    Yellow,
    Pink,
    Purple,
    Brown
}

// 定义对应的十六进制颜色值
export const CarColorHex: Record<CarColors, string> = {
    [CarColors.Blue]: "#0000FF",
    [CarColors.Green]: "#008000",
    [CarColors.Red]: "#FF0000",
    [CarColors.White]: "#FFFFFF",
    [CarColors.Yellow]: "#FFFF00",
    [CarColors.Pink]: "#FFC0CB",
    [CarColors.Purple]: "#800080",
    [CarColors.Brown]: "#A52A2A"
};