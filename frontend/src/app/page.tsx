"use client";

import { FoliageCard } from "@/components/foliage-card";
import { FoliageStatusOverview } from "@/components/foliage-status-overview";
import { ImageModal } from "@/components/image-modal";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchFoliageSpots } from "@/lib/api";
import { FoliageSpot } from "@/types/autumn";
import {
  AlertCircle,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Home page component for Hachimantai autumn foliage information
 */
export default function Home() {
  // Data state management
  const [allSpots, setAllSpots] = useState<FoliageSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state management
  const [selectedSpot, setSelectedSpot] = useState<FoliageSpot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSpotClick = (spot: FoliageSpot) => {
    setSelectedSpot(spot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSpot(null);
  };

  /**
   * Fetch foliage spots data from API
   */
  const loadFoliageSpots = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const spots = await fetchFoliageSpots();
      setAllSpots(spots);
    } catch (err) {
      console.error("Failed to load foliage spots:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setAllSpots([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load data on component mount
   */
  useEffect(() => {
    loadFoliageSpots();
  }, []);

  /**
   * Retry loading data
   */
  const handleRetry = () => {
    loadFoliageSpots();
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main className="w-full">
        {/* Minimal Compact Header */}
        <section className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-6">
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('/header.jpg')",
              }}
            />
          </div>
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              八幡平の紅葉状況
            </h1>
            <p className="text-sm sm:text-base text-white/90">
              岩手県八幡平市の最新紅葉情報をマップで確認
            </p>
          </div>
        </section>

        {/* Loading State */}
        {isLoading && (
          <section className="bg-white border-b-2 border-slate-100">
            <div className="w-full px-2 sm:px-4 lg:px-6 py-8">
              <div className="container mx-auto max-w-7xl text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600" />
                <p className="text-slate-600">紅葉情報を読み込んでいます...</p>
              </div>
            </div>
          </section>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <section className="bg-red-50 border-b-2 border-red-100">
            <div className="w-full px-2 sm:px-4 lg:px-6 py-6">
              <div className="container mx-auto max-w-7xl text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  データの読み込みに失敗しました
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  再試行
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Full-Width Google Map Section - Priority Display */}
        {!isLoading && (
          <section id="map" className="bg-white border-b-2 border-slate-100">
            <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
              <div className="container mx-auto max-w-7xl">
                <FoliageStatusOverview spots={allSpots} />
              </div>
            </div>
          </section>
        )}

        {/* Detailed Spots Information */}
        {!isLoading && (
          <section
            id="spots"
            className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50"
          >
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
                  各スポット詳細情報
                </h2>
                <p className="text-base text-slate-600 max-w-2xl mx-auto">
                  八幡平市内全{allSpots.length}箇所の紅葉スポット
                </p>
              </div>

              {allSpots.length === 0 && !error ? (
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-4">
                    <MapPin className="w-12 h-12 mx-auto mb-3" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">
                    データがありません
                  </h3>
                  <p className="text-slate-500">
                    現在表示できる紅葉スポット情報がありません。
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allSpots.map((spot) => (
                    <FoliageCard
                      key={spot.id}
                      spot={spot}
                      className="h-full"
                      onClick={handleSpotClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* About Section */}
        <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-800 mb-6">
                八幡平について
              </h2>
              <p className="text-xl text-slate-600">
                自然豊かな八幡平市の魅力をご紹介
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <MapPin className="w-6 h-6" />
                    アクセス情報
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    八幡平市へのアクセス方法
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-slate-700">
                        車でお越しの場合:
                      </span>
                      <span className="text-slate-600">
                        東北自動車道 松尾八幡平ICから約15分
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-slate-700">
                        バスでお越しの場合:
                      </span>
                      <span className="text-slate-600">
                        盛岡駅から岩手県北バス利用
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-slate-700">
                        電車でお越しの場合:
                      </span>
                      <span className="text-slate-600">
                        JR花輪線 大更駅下車
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <Clock className="w-6 h-6" />
                    見頃時期
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    八幡平の紅葉シーズン
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-slate-700">
                        山頂付近:
                      </span>
                      <span className="text-slate-600">9月下旬〜10月上旬</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-slate-700">
                        中腹エリア:
                      </span>
                      <span className="text-slate-600">10月上旬〜10月中旬</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-slate-700">
                        麓エリア:
                      </span>
                      <span className="text-slate-600">10月中旬〜10月下旬</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-800 px-8 py-3"
                asChild
              >
                <a
                  href="https://www.hachimantai.or.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center text-slate-700 hover:text-slate-800 no-underline"
                >
                  <ExternalLink className="w-5 h-5 mr-3" />
                  八幡平市観光協会公式サイト
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                八幡平紅葉情報
              </h3>
              <p className="text-slate-300 leading-relaxed">
                豊かな自然の大パノラマ、岩手山・八幡平・安比高原・七時雨の美しい紅葉スポットの最新情報をお届けするサイトです。
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-white mb-4">
                お問い合わせ
              </h4>
              <div className="space-y-3 text-slate-300">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" />
                  <span>一般社団法人 八幡平市観光協会</span>
                </div>
                <div className="pl-8">
                  <div>TEL: 0195-78-3500</div>
                  <div className="mt-1">
                    〒028-7303 岩手県八幡平市柏台一丁目28番地
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-white mb-4">更新情報</h4>
              <div className="text-slate-300">
                <p>最終更新: 2025年9月17日</p>
                <p className="mt-3 leading-relaxed">
                  紅葉状況は毎週火曜日・金曜日に更新予定です。
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Image Modal */}
      <ImageModal
        spot={selectedSpot}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
