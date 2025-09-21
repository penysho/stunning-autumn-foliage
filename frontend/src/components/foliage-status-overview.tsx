"use client";

import { foliageStatusInfo } from "@/lib/autumn-data";
import { FoliageSpot } from "@/types/autumn";
import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useRef, useState } from "react";

interface FoliageStatusOverviewProps {
  spots: FoliageSpot[];
}

/**
 * Interactive Google Maps showing foliage status with enhanced markers and floating legend
 */
export function FoliageStatusOverview({ spots }: FoliageStatusOverviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(
    null
  );
  const [legendDiv, setLegendDiv] = useState<HTMLDivElement | null>(null);

  // Calculate statistics for each status
  const statusCounts = Object.keys(foliageStatusInfo).reduce((acc, status) => {
    acc[status] = spots.filter((spot) => spot.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  // Get the most recent update date
  const lastUpdate = spots.reduce((latest, spot) => {
    return new Date(spot.updatedAt) > new Date(latest)
      ? spot.updatedAt
      : latest;
  }, spots[0]?.updatedAt || "");

  /**
   * Create enhanced marker icon based on foliage status with larger size and better visibility
   */
  const createMarkerIcon = (status: string): google.maps.Symbol => {
    const statusInfo =
      foliageStatusInfo[status as keyof typeof foliageStatusInfo];
    const colorMap: Record<string, string> = {
      "bg-green-500": "#10b981",
      "bg-yellow-400": "#fbbf24",
      "bg-orange-500": "#f97316",
      "bg-red-500": "#ef4444",
      "bg-amber-600": "#d97706",
      "bg-gray-500": "#6b7280",
    };

    const color = colorMap[statusInfo.color] || "#6b7280";

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.9,
      strokeColor: "#ffffff",
      strokeWeight: 3,
      scale: 12, // Increased size for better visibility
    };
  };

  /**
   * Create floating legend overlay on the map
   */
  const createMapLegend = (map: google.maps.Map): HTMLDivElement => {
    const div = document.createElement("div");
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(div);
    return div;
  };

  /**
   * Update legend content with current foliage status data
   */
  const updateLegendContent = (div: HTMLDivElement): void => {
    div.innerHTML = `
      <div style="
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 16px;
        margin: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-family: system-ui, -apple-system, sans-serif;
        min-width: 200px;
      ">
        <h3 style="
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          text-align: center;
        ">紅葉状況</h3>
        ${Object.entries(foliageStatusInfo)
          .map(
            ([status, info]) => `
          <div style="
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            font-size: 12px;
          ">
            <div style="
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background-color: ${(() => {
                const colorMap: Record<string, string> = {
                  "bg-green-500": "#10b981",
                  "bg-yellow-400": "#fbbf24",
                  "bg-orange-500": "#f97316",
                  "bg-red-500": "#ef4444",
                  "bg-amber-600": "#d97706",
                  "bg-gray-500": "#6b7280",
                };
                return colorMap[info.color] || "#6b7280";
              })()};
              border: 2px solid white;
              margin-right: 8px;
              flex-shrink: 0;
            "></div>
            <div style="flex: 1;">
              <div style="
                font-weight: 500;
                color: #374151;
                line-height: 1.2;
              ">${info.emoji} ${info.label}</div>
              <div style="
                color: #6b7280;
                font-size: 10px;
                margin-top: 2px;
              ">${statusCounts[status]}箇所</div>
            </div>
          </div>
        `
          )
          .join("")}
        <div style="
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
          font-size: 10px;
          color: #6b7280;
          text-align: center;
        ">
          最終更新: ${lastUpdate}<br>
          全${spots.length}箇所
        </div>
      </div>
    `;
  };

  /**
   * Create enhanced info window content for a spot
   */
  const createInfoWindowContent = (spot: FoliageSpot): string => {
    const statusInfo = foliageStatusInfo[spot.status];
    const colorMap: Record<string, string> = {
      "bg-green-500": "#10b981",
      "bg-yellow-400": "#fbbf24",
      "bg-orange-500": "#f97316",
      "bg-red-500": "#ef4444",
      "bg-amber-600": "#d97706",
      "bg-gray-500": "#6b7280",
    };
    const statusColor = colorMap[statusInfo.color] || "#6b7280";

    return `
      <div style="
        padding: 16px;
        max-width: 300px;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <h3 style="
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
          line-height: 1.3;
        ">${spot.name}</h3>
        ${
          spot.nameEn
            ? `<p style="
                font-size: 13px;
                color: #6b7280;
                margin: 0 0 12px 0;
                font-style: italic;
              ">${spot.nameEn}</p>`
            : ""
        }
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        ">
          <div style="
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: ${statusColor};
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          "></div>
          <span style="font-size: 16px;">${statusInfo.emoji}</span>
          <span style="
            font-size: 13px;
            font-weight: 600;
            color: #374151;
          ">${statusInfo.label}</span>
        </div>
        ${
          spot.description
            ? `<p style="
                font-size: 13px;
                color: #4b5563;
                margin: 0 0 12px 0;
                line-height: 1.4;
              ">${spot.description}</p>`
            : ""
        }
        <div style="
          font-size: 11px;
          color: #9ca3af;
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
        ">
          更新日: ${spot.updatedAt}
        </div>
      </div>
    `;
  };

  /**
   * Initialize Google Maps
   */
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
          libraries: ["maps"],
        });

        const google = await loader.load();

        // Center map on Hachimantai area
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 39.9392, lng: 140.8517 }, // Hachimantai Aspite Line
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.HYBRID,
          styles: [
            // Optimize label visibility for HYBRID map type
            {
              featureType: "administrative.locality",
              elementType: "labels.text.fill",
              stylers: [{ color: "#1f2937" }], // Dark gray for city/town names
            },
            {
              featureType: "administrative.locality",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#ffffff" }, { weight: 2 }], // White outline for better contrast
            },
            {
              featureType: "administrative.neighborhood",
              elementType: "labels.text.fill",
              stylers: [{ color: "#374151" }], // Slightly lighter for smaller areas
            },
            {
              featureType: "administrative.neighborhood",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#ffffff" }, { weight: 1.5 }],
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.fill",
              stylers: [{ color: "#1f2937" }], // Dark text for highway labels
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#ffffff" }, { weight: 2 }],
            },
            {
              featureType: "road.arterial",
              elementType: "labels.text.fill",
              stylers: [{ color: "#374151" }],
            },
            {
              featureType: "road.arterial",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#ffffff" }, { weight: 1.5 }],
            },
            {
              featureType: "road.local",
              elementType: "labels.text.fill",
              stylers: [{ color: "#4b5563" }],
            },
            {
              featureType: "road.local",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#ffffff" }, { weight: 1 }],
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.fill",
              stylers: [{ color: "#065f46" }], // Dark green for parks
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#ffffff" }, { weight: 2 }],
            },
            {
              featureType: "poi.attraction",
              elementType: "labels.text.fill",
              stylers: [{ color: "#7c2d12" }], // Brown for attractions
            },
            {
              featureType: "poi.attraction",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#ffffff" }, { weight: 2 }],
            },
            {
              featureType: "water",
              elementType: "labels.text.fill",
              stylers: [{ color: "#1e40af" }], // Blue for water bodies
            },
            {
              featureType: "water",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#ffffff" }, { weight: 2 }],
            },
            // Reduce clutter by hiding some POI categories
            {
              featureType: "poi.business",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "poi.medical",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "poi.school",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "poi.sports_complex",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            // Enhance mountain/terrain labels for better visibility
            {
              featureType: "landscape.natural.terrain",
              elementType: "labels.text.fill",
              stylers: [{ color: "#78350f" }], // Brown for terrain labels
            },
            {
              featureType: "landscape.natural.terrain",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#ffffff" }, { weight: 2 }],
            },
          ],
        });

        const infoWindowInstance = new google.maps.InfoWindow();

        // Create legend div (empty initially)
        const legend = createMapLegend(mapInstance);

        setMap(mapInstance);
        setInfoWindow(infoWindowInstance);
        setLegendDiv(legend);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
      }
    };

    initMap();
  }, []); // Remove all dependencies to prevent re-initialization

  /**
   * Update legend when foliage data changes
   */
  useEffect(() => {
    if (legendDiv) {
      updateLegendContent(legendDiv);
    }
  }, [legendDiv, statusCounts, lastUpdate, spots.length]);

  /**
   * Create markers for all spots
   */
  useEffect(() => {
    if (!map || !infoWindow) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];

    spots.forEach((spot) => {
      if (!spot.location) return;

      const marker = new google.maps.Marker({
        position: { lat: spot.location.lat, lng: spot.location.lng },
        map: map,
        title: spot.name,
        icon: createMarkerIcon(spot.status),
      });

      marker.addListener("click", () => {
        infoWindow.setContent(createInfoWindowContent(spot));
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [map, infoWindow, spots]);

  return (
    <div className="w-full">
      {/* Full-screen Google Map with floating legend */}
      <div
        ref={mapRef}
        className="w-full h-[600px] rounded-xl border border-slate-200 shadow-lg"
        style={{ minHeight: "600px" }}
      />
    </div>
  );
}
