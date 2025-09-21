/**
 * Autumn foliage status types for Hachimantai tourism website
 */

export type FoliageStatus =
  | "green" // 青葉
  | "beginning" // 色づき始め
  | "colored" // 色づき
  | "peak" // 見頃
  | "fading" // 色あせ始め
  | "finished";

export interface FoliageSpot {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  status: FoliageStatus;
  imageUrl?: string;
  location?: {
    lat: number;
    lng: number;
  };
  updatedAt: string;
  featured?: boolean;
}

export interface FoliageStatusInfo {
  status: FoliageStatus;
  label: string;
  color: string;
  description: string;
  emoji: string;
}
