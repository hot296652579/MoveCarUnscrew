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
    Blue = 1,
    Green = 2,
    Red = 3,
    White = 4,
    Yellow = 5,
    Pink = 6,
    Purple = 7,
    Brown = 8,
    Black = 9
}

// 定义对应的十六进制颜色值
export const CarColorHex: Record<CarColors, string> = {
    [CarColors.Blue]: "#1B24F0",
    [CarColors.Green]: "#1BF01B",
    [CarColors.Red]: "#F0241B",
    [CarColors.White]: "#F0FAFA",
    [CarColors.Yellow]: "#EBF32A",
    [CarColors.Pink]: "#EB88BB",
    [CarColors.Purple]: "#F32AF3",
    [CarColors.Brown]: "#F5A71D",
    [CarColors.Black]: "#000000",
};