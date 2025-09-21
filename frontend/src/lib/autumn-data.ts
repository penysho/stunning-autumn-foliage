import { FoliageStatus, FoliageStatusInfo } from "@/types/autumn";

/**
 * Foliage status information with colors and descriptions
 */
export const foliageStatusInfo: Record<FoliageStatus, FoliageStatusInfo> = {
  green: {
    foliageStatus: "green",
    label: "青葉",
    color: "bg-green-500",
    description: "まだ緑の葉が茂っています",
    emoji: "🌿",
  },
  beginning: {
    foliageStatus: "beginning",
    label: "色づき始め",
    color: "bg-yellow-400",
    description: "少しずつ色づき始めています",
    emoji: "🍂",
  },
  colored: {
    foliageStatus: "colored",
    label: "色づき",
    color: "bg-orange-500",
    description: "美しく色づいています",
    emoji: "🍁",
  },
  peak: {
    foliageStatus: "peak",
    label: "見頃",
    color: "bg-red-500",
    description: "紅葉が最も美しい時期です",
    emoji: "🔥",
  },
  fading: {
    foliageStatus: "fading",
    label: "色あせ始め",
    color: "bg-amber-600",
    description: "色あせが始まっています",
    emoji: "🍂",
  },
  finished: {
    foliageStatus: "finished",
    label: "終了",
    color: "bg-gray-500",
    description: "紅葉シーズンが終了しました",
    emoji: "🍃",
  },
};

/**
 * Get foliage status information by foliage status
 */
export function getFoliageStatusInfo(
  foliageStatus: FoliageStatus
): FoliageStatusInfo {
  return foliageStatusInfo[foliageStatus];
}
