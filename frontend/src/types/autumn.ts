/**
 * Autumn foliage status types for Hachimantai tourism website
 */

export type FoliageStatus =
  | "green" // 青葉
  | "beginning" // 色づき始め
  | "colored" // 色づき
  | "peak" // 見頃
  | "fading" // 色あせ始め
  | "finished"; // 終了

export interface ImageSizes {
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  original?: string;
}

export interface FoliageSpot {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  foliageStatus: FoliageStatus;
  imageUrl?: string; // Main image URL (usually medium or original)
  imageSizes?: ImageSizes; // Multiple image sizes for responsive design
  location?: {
    lat: number;
    lng: number;
  };
  updatedAt: string;
  featured?: boolean;
}

export interface FoliageStatusInfo {
  foliageStatus: FoliageStatus;
  label: string;
  color: string;
  description: string;
  emoji: string;
}
