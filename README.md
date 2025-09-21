# 八幡平紅葉情報サイト - 設定手順

このプロジェクトは、岩手県八幡平市の紅葉情報を提供するWebサイトです。フロントエンドはNext.js、バックエンドはStrapiを使用しています。

## 前提条件

- Node.js 18.x 以上
- npm または pnpm

## セットアップ手順

### 1. バックエンド（Strapi）のセットアップ

```bash
cd backend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run develop
```

初回起動時にStrapiの管理者アカウントを作成してください。

### 2. 紅葉スポットデータのシード

Strapiが起動したら、紅葉スポットの初期データをシードします：

```bash
# backendディレクトリで実行
npm run seed:foliage-spots
```

### 3. フロントエンドのセットアップ

新しいターミナルウィンドウで：

```bash
cd frontend

# 依存関係のインストール
pnpm install
# または npm install

# 環境変数ファイルの作成
cp .env.example .env.local
```

`.env.local`ファイルを編集して、必要な環境変数を設定：

```env
# Strapi Backend Configuration
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337/api

# Google Maps API Key (オプション)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 4. フロントエンドの起動

```bash
# frontendディレクトリで実行
pnpm dev
# または npm run dev
```

## アクセス

- フロントエンド: <http://localhost:3000>
- Strapi管理画面: <http://localhost:1337/admin>
- Strapi API: <http://localhost:1337/api>

## 機能

### 実装済み機能

1. **紅葉スポットの表示**
   - 八幡平市内の10箇所の紅葉スポット
   - 各スポットの詳細情報（名前、説明、位置情報、ステータス）

2. **インタラクティブマップ**
   - Google Maps統合
   - 紅葉ステータス別のマーカー表示
   - レスポンシブデザイン

3. **データ管理**
   - StrapiでのCMS機能
   - RESTful API
   - 画像アップロード対応

4. **エラーハンドリング**
   - API接続エラー時のフォールバック
   - ローディング状態の表示
   - 再試行機能

### 紅葉ステータス

- `green`: 青葉
- `beginning`: 色づき始め
- `colored`: 色づき
- `peak`: 見頃
- `fading`: 色あせ始め
- `finished`: 終了

## 開発

### データの更新

Strapi管理画面（<http://localhost:1337/admin）から紅葉スポットのデータを更新できます。>

### APIエンドポイント

- `GET /api/foliage-spots` - 全ての紅葉スポット取得
- `GET /api/foliage-spots/:id` - 特定のスポット取得
- フィルター例:
  - `?filters[status][$eq]=peak` - 見頃のスポットのみ
  - `?filters[featured][$eq]=true` - 注目スポットのみ

## トラブルシューティング

### API接続エラー

1. Strapiサーバーが起動していることを確認
2. 環境変数が正しく設定されていることを確認
3. CORS設定を確認（必要に応じてStrapiの設定を調整）

### 画像が表示されない場合

1. 画像ファイルが`backend/data/uploads/`に存在することを確認
2. Strapiでメディアが正しくアップロードされていることを確認

## 本番環境での注意事項

1. 環境変数の設定
2. データベースの設定（本番では PostgreSQL 等を推奨）
3. 画像の最適化とCDN設定
4. セキュリティ設定の確認
