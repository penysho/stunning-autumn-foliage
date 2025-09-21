import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getFoliageStatusInfo } from "@/lib/autumn-data";
import { FoliageSpot } from "@/types/autumn";
import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";

interface FoliageCardProps {
  spot: FoliageSpot;
  className?: string;
  featured?: boolean;
  onClick?: (spot: FoliageSpot) => void;
}

/**
 * Foliage spot card component for displaying autumn foliage information
 */
export function FoliageCard({
  spot,
  className = "",
  featured = false,
  onClick,
}: FoliageCardProps) {
  const statusInfo = getFoliageStatusInfo(spot.foliageStatus);

  const handleClick = () => {
    if (onClick) {
      onClick(spot);
    }
  };

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] bg-white border-0 shadow-lg cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {spot.imageUrl && (
        <div className="relative h-64 overflow-hidden">
          <Image
            src={spot.imageUrl}
            alt={spot.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Dark gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {featured && (
            <div className="absolute top-4 left-4">
              <Badge
                variant="secondary"
                className="bg-white/90 text-slate-800 border-0 font-semibold px-3 py-1"
              >
                ⭐ おすすめ
              </Badge>
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Badge
              className="bg-slate-800/80 text-white border-0 px-3 py-1 font-semibold backdrop-blur-sm"
              variant="secondary"
            >
              {statusInfo.emoji} {statusInfo.label}
            </Badge>
          </div>

          {/* Title overlay on image */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white leading-tight mb-1">
              {spot.name}
            </h3>
            {spot.nameEn && (
              <p className="text-sm text-white/80 font-medium">{spot.nameEn}</p>
            )}
          </div>
        </div>
      )}

      <CardContent className="p-6">
        {spot.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
            {spot.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>更新: {spot.updatedAt}</span>
          </div>

          {spot.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>位置情報あり</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">{statusInfo.label}:</span>{" "}
            {statusInfo.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
