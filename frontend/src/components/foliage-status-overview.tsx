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

  // Calculate statistics for each foliage status
  const statusCounts = Object.keys(foliageStatusInfo).reduce((acc, status) => {
    acc[status] = spots.filter((spot) => spot.foliageStatus === status).length;
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
   * Check if the current viewport is mobile sized
   */
  const isMobile = (): boolean => {
    return window.innerWidth < 768; // md breakpoint
  };

  /**
   * Create floating legend overlay on the map with responsive positioning
   */
  const createMapLegend = (map: google.maps.Map): HTMLDivElement => {
    const div = document.createElement("div");
    // Use different positions based on screen size
    const position = isMobile()
      ? google.maps.ControlPosition.BOTTOM_CENTER
      : google.maps.ControlPosition.RIGHT_TOP;
    map.controls[position].push(div);
    return div;
  };

  /**
   * Update legend content with current foliage status data - responsive design
   */
  const updateLegendContent = (div: HTMLDivElement): void => {
    const mobile = isMobile();

    div.innerHTML = `
      <div style="
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: ${mobile ? "8px" : "12px"};
        padding: ${mobile ? "8px 12px" : "16px"};
        margin: ${mobile ? "5px" : "10px"};
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-family: system-ui, -apple-system, sans-serif;
        ${mobile ? "max-width: 90vw; width: auto;" : "min-width: 240px;"}
        ${mobile ? "overflow-x: auto;" : ""}
      ">
        ${
          mobile
            ? `
          <!-- Mobile: Horizontal scrollable layout -->
          <div style="
            display: flex;
            gap: 12px;
            align-items: center;
            white-space: nowrap;
            padding-bottom: 4px;
          ">
            <div style="
              font-size: 12px;
              font-weight: 600;
              color: #1f2937;
              flex-shrink: 0;
            ">状況:</div>
            ${Object.entries(foliageStatusInfo)
              .map(
                ([status, info]) => `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  flex-shrink: 0;
                  font-size: 11px;
                ">
                  <div style="
                    width: 12px;
                    height: 12px;
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
                    border: 1px solid white;
                    flex-shrink: 0;
                  "></div>
                  <span style="
                    color: #374151;
                    font-weight: 500;
                  ">${info.emoji}</span>
                  <span style="
                    color: #6b7280;
                  ">${statusCounts[status]}</span>
                </div>
              `
              )
              .join("")}
          </div>
        `
            : `
            <!-- Desktop: Vertical layout with larger fonts -->
            <h3 style="
              margin: 0 0 16px 0;
              font-size: 18px;
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
                margin-bottom: 12px;
                font-size: 15px;
              ">
                <div style="
                  width: 20px;
                  height: 20px;
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
                  margin-right: 10px;
                  flex-shrink: 0;
                "></div>
                <div style="flex: 1;">
                  <div style="
                    font-weight: 600;
                    color: #374151;
                    line-height: 1.3;
                    font-size: 15px;
                  ">${info.emoji} ${info.label}</div>
                  <div style="
                    color: #6b7280;
                    font-size: 13px;
                    margin-top: 3px;
                    font-weight: 500;
                  ">${statusCounts[status]}箇所</div>
                </div>
              </div>
            `
              )
              .join("")}
            <div style="
              margin-top: 16px;
              padding-top: 12px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
              line-height: 1.4;
            ">
              最終更新: ${lastUpdate}<br>
              全${spots.length}箇所
            </div>
         `
        }
      </div>
    `;
  };

  /**
   * Create enhanced info window content for a spot
   */
  const createInfoWindowContent = (spot: FoliageSpot): string => {
    const statusInfo = foliageStatusInfo[spot.foliageStatus];
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

        // Add resize listener to handle responsive legend positioning
        const handleResize = () => {
          if (legend && legend.parentNode) {
            // Remove legend from current position
            legend.parentNode.removeChild(legend);

            // Re-add legend with new position
            const newPosition = isMobile()
              ? google.maps.ControlPosition.BOTTOM_CENTER
              : google.maps.ControlPosition.RIGHT_TOP;
            mapInstance.controls[newPosition].push(legend);

            // Update legend content for new screen size
            updateLegendContent(legend);
          }
        };

        window.addEventListener("resize", handleResize);

        // Cleanup resize listener
        return () => {
          window.removeEventListener("resize", handleResize);
        };
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
        icon: createMarkerIcon(spot.foliageStatus),
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
      {/* Responsive Google Map with optimized height for mobile */}
      <div
        ref={mapRef}
        className="w-full h-[60vh] sm:h-[70vh] md:h-[75vh] lg:h-[80vh] xl:h-[85vh] min-h-[400px] max-h-[900px] rounded-lg sm:rounded-xl border border-slate-200 shadow-lg"
        style={{ minHeight: "400px" }}
      />
    </div>
  );
}
