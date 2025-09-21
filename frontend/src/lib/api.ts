import { FoliageSpot, FoliageStatus, ImageSizes } from "@/types/autumn";

/**
 * API base configuration
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337/api";

/**
 * Strapi API response types
 */
interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
  path?: string | null;
}

interface StrapiImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string | null;
  caption?: string | null;
  width: number;
  height: number;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string | null;
  provider: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

/**
 * Transform Strapi foliage spot data to our FoliageSpot type
 */
function transformFoliageSpot(strapiSpot: any): FoliageSpot {
  if (!strapiSpot) {
    throw new Error(
      "Invalid foliage spot data: strapiSpot is null or undefined"
    );
  }

  if (!strapiSpot.name) {
    throw new Error("Invalid foliage spot data: name is required");
  }

  // Handle image URLs
  let imageUrl: string | undefined;
  let imageSizes: ImageSizes | undefined;
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  if (strapiSpot.image?.url) {
    imageUrl = `${baseUrl}${strapiSpot.image.url}`;

    imageSizes = {
      original: `${baseUrl}${strapiSpot.image.url}`,
    };

    if (strapiSpot.image.formats) {
      const formats = strapiSpot.image.formats;

      if (formats.thumbnail?.url) {
        imageSizes.thumbnail = `${baseUrl}${formats.thumbnail.url}`;
      }
      if (formats.small?.url) {
        imageSizes.small = `${baseUrl}${formats.small.url}`;
      }
      if (formats.medium?.url) {
        imageSizes.medium = `${baseUrl}${formats.medium.url}`;
        // Use medium as the default imageUrl for better performance
        imageUrl = `${baseUrl}${formats.medium.url}`;
      }
      if (formats.large?.url) {
        imageSizes.large = `${baseUrl}${formats.large.url}`;
      }
    }
  }

  return {
    id: strapiSpot.documentId || strapiSpot.id?.toString() || "",
    name: strapiSpot.name,
    nameEn: strapiSpot.nameEn,
    description: strapiSpot.description,
    foliageStatus: strapiSpot.foliageStatus || "green",
    imageUrl,
    imageSizes,
    location:
      strapiSpot.latitude && strapiSpot.longitude
        ? { lat: strapiSpot.latitude, lng: strapiSpot.longitude }
        : undefined,
    updatedAt: strapiSpot.updatedAt
      ? new Date(strapiSpot.updatedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    featured: strapiSpot.featured || false,
  };
}

/**
 * Fetch foliage spots from Strapi API
 */
export async function fetchFoliageSpots(): Promise<FoliageSpot[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/foliage-spots?populate=image&sort=featured:desc,name:asc&pagination[pageSize]=50`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch foliage spots: ${response.status} ${response.statusText}`
      );
    }

    const result: StrapiResponse<any[]> = await response.json();

    if (!result.data || !Array.isArray(result.data)) {
      throw new Error(
        "Invalid API response: no data field or data is not an array"
      );
    }

    return result.data.map(transformFoliageSpot);
  } catch (error) {
    console.error("Error fetching foliage spots:", error);
    throw error;
  }
}

/**
 * Fetch a single foliage spot by ID
 */
export async function fetchFoliageSpot(
  id: string
): Promise<FoliageSpot | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/foliage-spots/${id}?populate=image`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(
        `Failed to fetch foliage spot: ${response.status} ${response.statusText}`
      );
    }

    const result: { data: any } = await response.json();

    if (!result.data) {
      throw new Error("Invalid API response: no data field");
    }

    return transformFoliageSpot(result.data);
  } catch (error) {
    console.error("Error fetching foliage spot:", error);
    throw error;
  }
}

/**
 * Fetch featured foliage spots
 */
export async function fetchFeaturedFoliageSpots(): Promise<FoliageSpot[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/foliage-spots?populate=image&filters[featured][$eq]=true&sort=name:asc`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch featured foliage spots: ${response.status} ${response.statusText}`
      );
    }

    const result: StrapiResponse<any[]> = await response.json();

    if (!result.data || !Array.isArray(result.data)) {
      throw new Error(
        "Invalid API response: no data field or data is not an array"
      );
    }

    return result.data.map(transformFoliageSpot);
  } catch (error) {
    console.error("Error fetching featured foliage spots:", error);
    throw error;
  }
}

/**
 * Fetch foliage spots by foliage status
 */
export async function fetchFoliageSpotsByStatus(
  foliageStatus: FoliageStatus
): Promise<FoliageSpot[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/foliage-spots?populate=image&filters[foliageStatus][$eq]=${foliageStatus}&sort=featured:desc,name:asc`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch foliage spots by status: ${response.status} ${response.statusText}`
      );
    }

    const result: StrapiResponse<any[]> = await response.json();

    if (!result.data || !Array.isArray(result.data)) {
      throw new Error(
        "Invalid API response: no data field or data is not an array"
      );
    }

    return result.data.map(transformFoliageSpot);
  } catch (error) {
    console.error("Error fetching foliage spots by status:", error);
    throw error;
  }
}

/**
 * API error class for better error handling
 */
export class ApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Get optimal image URL based on desired width
 * @param spot - Foliage spot with image data
 * @param targetWidth - Desired image width in pixels
 * @returns Optimal image URL for the target width
 */
export function getOptimalImageUrl(
  spot: FoliageSpot,
  targetWidth: number
): string | undefined {
  if (!spot.imageSizes && !spot.imageUrl) {
    return undefined;
  }

  // If no size options available, return the main imageUrl
  if (!spot.imageSizes) {
    return spot.imageUrl;
  }

  // Choose optimal size based on target width
  if (targetWidth <= 234 && spot.imageSizes.thumbnail) {
    return spot.imageSizes.thumbnail;
  }
  if (targetWidth <= 500 && spot.imageSizes.small) {
    return spot.imageSizes.small;
  }
  if (targetWidth <= 750 && spot.imageSizes.medium) {
    return spot.imageSizes.medium;
  }
  if (targetWidth <= 1000 && spot.imageSizes.large) {
    return spot.imageSizes.large;
  }

  // Fallback to original or main imageUrl
  return spot.imageSizes.original || spot.imageUrl;
}

/**
 * Generate srcSet for responsive images
 * @param spot - Foliage spot with image data
 * @returns srcSet string for responsive images
 */
export function generateImageSrcSet(spot: FoliageSpot): string | undefined {
  if (!spot.imageSizes) {
    return undefined;
  }

  const srcSetEntries: string[] = [];

  if (spot.imageSizes.thumbnail) {
    srcSetEntries.push(`${spot.imageSizes.thumbnail} 234w`);
  }
  if (spot.imageSizes.small) {
    srcSetEntries.push(`${spot.imageSizes.small} 500w`);
  }
  if (spot.imageSizes.medium) {
    srcSetEntries.push(`${spot.imageSizes.medium} 750w`);
  }
  if (spot.imageSizes.large) {
    srcSetEntries.push(`${spot.imageSizes.large} 1000w`);
  }
  if (spot.imageSizes.original) {
    srcSetEntries.push(`${spot.imageSizes.original} 1500w`);
  }

  return srcSetEntries.length > 0 ? srcSetEntries.join(", ") : undefined;
}

/**
 * Health check for the API
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
      }/api/foliage-spots?pagination[pageSize]=1`,
      {
        method: "HEAD",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
}
