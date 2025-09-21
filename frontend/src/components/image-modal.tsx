"use client";

import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { getFoliageStatusInfo } from "@/lib/autumn-data";
import { FoliageSpot } from "@/types/autumn";
import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";

interface ImageModalProps {
  spot: FoliageSpot | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component specifically designed for displaying foliage spot images
 * with detailed information overlay
 */
export function ImageModal({ spot, isOpen, onClose }: ImageModalProps) {
  if (!spot) return null;

  const statusInfo = getFoliageStatusInfo(spot.foliageStatus);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-5xl max-h-[95vh] overflow-hidden"
    >
      <div className="relative max-h-[95vh] overflow-y-auto">
        {/* Main Image */}
        <div className="relative h-[45vh] min-h-[300px] max-h-[400px] bg-slate-100">
          {spot.imageUrl && (
            <Image
              src={spot.imageUrl}
              alt={spot.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          )}

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-6 left-6">
            <Badge
              className="bg-white/95 text-slate-800 border-0 px-4 py-2 font-semibold backdrop-blur-sm text-base"
              variant="secondary"
            >
              {statusInfo.emoji} {statusInfo.label}
            </Badge>
          </div>
        </div>

        {/* Information Panel */}
        <div className="p-6 md:p-8 bg-white">
          {/* Title Section */}
          <div className="mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              {spot.name}
            </h2>
            {spot.nameEn && (
              <p className="text-base md:text-lg text-slate-600 font-medium">
                {spot.nameEn}
              </p>
            )}
          </div>

          {/* Description */}
          {spot.description && (
            <div className="mb-4 md:mb-6">
              <p className="text-slate-700 leading-relaxed text-base md:text-lg">
                {spot.description}
              </p>
            </div>
          )}

          {/* Status Information */}
          <div className="mb-4 md:mb-6 p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-base md:text-lg font-semibold text-slate-800 mb-3">
              現在の紅葉状況
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-4 h-4 rounded-full ${statusInfo.color}`} />
              <span className="font-semibold text-slate-800 text-base md:text-lg">
                {statusInfo.label}
              </span>
            </div>
            <p className="text-slate-700 text-sm md:text-base">
              {statusInfo.description}
            </p>
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap gap-4 md:gap-6 text-slate-600 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
              <span>更新日: {spot.updatedAt}</span>
            </div>

            {spot.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                <span>
                  位置: {spot.location.lat.toFixed(4)},{" "}
                  {spot.location.lng.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
