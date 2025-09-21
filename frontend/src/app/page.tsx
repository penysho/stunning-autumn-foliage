import { FoliageCard } from "@/components/foliage-card";
import { FoliageStatusOverview } from "@/components/foliage-status-overview";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getFeaturedSpots, mockFoliageSpots } from "@/lib/autumn-data";
import { Clock, ExternalLink, MapPin, Phone } from "lucide-react";

/**
 * Home page component for Hachimantai autumn foliage information
 */
export default function Home() {
  const featuredSpots = getFeaturedSpots();
  const allSpots = mockFoliageSpots;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main className="w-full">
        {/* Compact Header Section */}
        <section className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-12">
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('/genbugan.JPEG')",
              }}
            />
          </div>
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              八幡平の紅葉状況
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              岩手県八幡平市の素晴らしい紅葉スポットの最新情報
            </p>
          </div>
        </section>

        {/* All Spots Section */}
        <section id="spots" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-slate-800 mb-6">
                最新情報
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                八幡平市内の全ての紅葉スポットの最新情報
              </p>
            </div>

            {/* Primary Status Overview Section */}
            <div className="py-8 px-4 sm:px-6 lg:px-8 bg-white">
              <div className="container mx-auto max-w-6xl">
                <FoliageStatusOverview spots={allSpots} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allSpots.map((spot) => (
                <FoliageCard key={spot.id} spot={spot} className="h-full" />
              ))}
            </div>
          </div>
        </section>

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
                        🚗 車でお越しの場合:
                      </span>
                      <span className="text-slate-600">
                        東北自動車道 松尾八幡平ICから約15分
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-slate-700">
                        🚌 バスでお越しの場合:
                      </span>
                      <span className="text-slate-600">
                        盛岡駅から岩手県北バス利用
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-slate-700">
                        🚄 電車でお越しの場合:
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
                        🏔️ 山頂付近:
                      </span>
                      <span className="text-slate-600">9月下旬〜10月上旬</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-slate-700">
                        🌲 中腹エリア:
                      </span>
                      <span className="text-slate-600">10月上旬〜10月中旬</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-slate-700">
                        🏞️ 麓エリア:
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
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3"
              >
                <ExternalLink className="w-5 h-5 mr-3" />
                八幡平市公式サイト
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
                岩手県八幡平市の美しい紅葉スポットの最新情報をお届けするサイトです。
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium text-white mb-4">
                お問い合わせ
              </h4>
              <div className="space-y-3 text-slate-300">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" />
                  <span>八幡平市観光協会</span>
                </div>
                <div className="pl-8">TEL: 0195-78-3500</div>
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

          <div className="mt-12 pt-8 border-t border-slate-700 text-center text-slate-400">
            <p>&copy; 2025 八幡平市観光協会. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
