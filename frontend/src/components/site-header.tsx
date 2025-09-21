import Link from "next/link";

/**
 * Site header component with navigation and branding
 */
export function SiteHeader() {
  return (
    <header className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                八幡平紅葉情報
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Hachimantai Autumn Foliage Information
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="#map"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              マップ
            </Link>
            <Link
              href="#spots"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              詳細情報
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              八幡平について
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
