import { FoliageSpot, FoliageStatus, FoliageStatusInfo } from "@/types/autumn";

/**
 * Foliage status information with colors and descriptions
 */
export const foliageStatusInfo: Record<FoliageStatus, FoliageStatusInfo> = {
  green: {
    status: "green",
    label: "青葉",
    color: "bg-green-500",
    description: "まだ緑の葉が茂っています",
    emoji: "🌿",
  },
  beginning: {
    status: "beginning",
    label: "色づき始め",
    color: "bg-yellow-400",
    description: "少しずつ色づき始めています",
    emoji: "🍂",
  },
  colored: {
    status: "colored",
    label: "色づき",
    color: "bg-orange-500",
    description: "美しく色づいています",
    emoji: "🍁",
  },
  peak: {
    status: "peak",
    label: "見頃",
    color: "bg-red-500",
    description: "紅葉が最も美しい時期です",
    emoji: "🔥",
  },
  fading: {
    status: "fading",
    label: "色あせ始め",
    color: "bg-amber-600",
    description: "色あせが始まっています",
    emoji: "🍂",
  },
  finished: {
    status: "finished",
    label: "終了",
    color: "bg-gray-500",
    description: "紅葉シーズンが終了しました",
    emoji: "🍃",
  },
};

/**
 * Sample foliage spots data for Hachimantai
 * In production, this would come from Strapi CMS
 */
export const mockFoliageSpots: FoliageSpot[] = [
  {
    id: "1",
    name: "八幡平アスピーテライン",
    nameEn: "Hachimantai Aspite Line",
    description:
      "全長約27kmの山岳道路。標高1,600m付近では早期に紅葉が楽しめます。",
    status: "green",
    imageUrl: "/sample1.jpg",
    location: { lat: 39.9392, lng: 140.8517 },
    updatedAt: "2025-09-17",
    featured: true,
  },
  {
    id: "2",
    name: "岩手山焼走り溶岩流",
    nameEn: "Mt.Iwate Yakehashiri Lava Flow",
    description:
      "岩手山の火山活動で形成された溶岩流跡地。独特の景観と紅葉のコントラストが魅力。",
    status: "green",
    imageUrl: "/genbugan.JPEG",
    location: { lat: 39.8503, lng: 140.9989 },
    updatedAt: "2025-09-17",
  },
  {
    id: "3",
    name: "八幡平山頂散策路",
    nameEn: "Hachimantai Summit Walking Trail",
    description:
      "標高1,613mの山頂付近を散策できる遊歩道。360度の大パノラマが楽しめます。",
    status: "beginning",
    imageUrl: "/santyo.JPG",
    location: { lat: 39.9589, lng: 140.8556 },
    updatedAt: "2025-09-17",
    featured: true,
  },
  {
    id: "4",
    name: "三ツ石山",
    nameEn: "Mt.Mitsuishi",
    description: "八幡平連峰の最高峰。登山道からの紅葉景色は格別です。",
    status: "green",
    imageUrl: "/sample2.jpg",
    location: { lat: 39.9167, lng: 140.9167 },
    updatedAt: "2025-09-17",
  },
  {
    id: "5",
    name: "松川大橋",
    nameEn: "Matsukawa Ohashi Bridge",
    description: "松川渓谷にかかる橋からの眺望が素晴らしい紅葉スポット。",
    status: "green",
    imageUrl: "/sample3.jpg",
    location: { lat: 39.9, lng: 140.8833 },
    updatedAt: "2025-09-17",
  },
  {
    id: "6",
    name: "松川渓谷玄武岩",
    nameEn: "Matsukawa Valley Genbuiwa",
    description: "松川の清流と玄武岩の奇岩、紅葉が織りなす絶景ポイント。",
    status: "green",
    imageUrl: "/genbugan.JPEG",
    location: { lat: 39.8889, lng: 140.8778 },
    updatedAt: "2025-09-17",
  },
  {
    id: "7",
    name: "黒谷地湿原",
    nameEn: "Kuroyachi Marsh",
    description: "高層湿原と周囲の山々の紅葉が美しいハイキングスポット。",
    status: "green",
    imageUrl: "/sample4.jpg",
    location: { lat: 39.9333, lng: 140.8667 },
    updatedAt: "2025-09-17",
  },
  {
    id: "8",
    name: "安比高原二次ブナ林",
    nameEn: "Appi Kogen Secondary Beech Forest",
    description: "ブナの巨木が立ち並ぶ神秘的な森林。黄金色に輝く紅葉が魅力。",
    status: "green",
    imageUrl: "/sample5.jpg",
    location: { lat: 40.0167, lng: 140.95 },
    updatedAt: "2025-09-17",
  },
  {
    id: "9",
    name: "森の大橋",
    nameEn: "Mori-no-Ohashi Bridge",
    description: "渓谷に架かる橋からの紅葉展望が楽しめる人気スポット。",
    status: "green",
    imageUrl: "/morinoohashi.jpg",
    location: { lat: 39.9111, lng: 140.8889 },
    updatedAt: "2025-09-17",
  },
  {
    id: "10",
    name: "不動の滝",
    nameEn: "Fudo Falls",
    description: "高さ15mの滝と周囲の紅葉が織りなす絶景スポット。",
    status: "green",
    imageUrl: "/sample6.jpg",
    location: { lat: 39.8944, lng: 140.8722 },
    updatedAt: "2025-09-17",
  },
];

/**
 * Get foliage status information by status
 */
export function getFoliageStatusInfo(status: FoliageStatus): FoliageStatusInfo {
  return foliageStatusInfo[status];
}

/**
 * Get featured foliage spots
 */
export function getFeaturedSpots(): FoliageSpot[] {
  return mockFoliageSpots.filter((spot) => spot.featured);
}

/**
 * Get spots by status
 */
export function getSpotsByStatus(status: FoliageStatus): FoliageSpot[] {
  return mockFoliageSpots.filter((spot) => spot.status === status);
}
