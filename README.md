# Kids Calendar Maker

子供の写真と手書き数字でつくる、世界に一つだけのカレンダーWebアプリ。

- Production: https://kids-calendar-blue.vercel.app
- Staging: https://kids-calendar-git-develop-toshios-projects-9cc7621f.vercel.app

## 機能

- 任意の開始月から12ヶ月分のカレンダーを作成（年をまたぐ範囲もOK）
- 月ごとの写真アップロード（ドラッグ&ドロップ対応）
- 写真の表示範囲（位置・拡大率）の調整
- 子供の手書き数字（0〜9）を取り込んで日付に使用（白背景は自動透過）
- 卓上縦 / 卓上横 / 壁かけ の3レイアウト
- PDF（12ヶ月1ファイル）/ PNG（個別）での出力

## 技術スタック

- Next.js 16 (App Router) + TypeScript
- TailwindCSS v4
- 状態管理: zustand
- PDF出力: jsPDF + html2canvas-pro
- ホスティング: Vercel

## セットアップ

```bash
yarn install
yarn dev
# http://localhost:3010
```

その他のスクリプト:

| コマンド | 用途 |
|---|---|
| `yarn dev` | 開発サーバー（port 3010） |
| `yarn build` | 本番ビルド |
| `yarn start` | 本番ビルドの起動（port 3010） |
| `yarn lint` | ESLint |

## ディレクトリ

```
src/
├── app/                  # Next.js App Router
├── components/           # UIコンポーネント
└── lib/                  # 状態管理・ロジック・型
    ├── store.ts          # zustand store
    ├── calendar.ts       # カレンダーグリッド計算
    ├── imageProcessing.ts # 白背景透過などの画像処理
    └── types.ts
```

## デプロイ

GitHubにpushするとVercelが自動でデプロイします。

| ブランチ | 環境 | URL |
|---|---|---|
| `main` | Production | https://kids-calendar-blue.vercel.app |
| `develop` | Staging (Preview) | https://kids-calendar-git-develop-toshios-projects-9cc7621f.vercel.app |
| `feature/*` | 個別Preview | push後に Vercel が個別URLを発行 |

### 開発フロー

```
feature/xxx → develop（動作確認）→ main（本番反映）
```

```bash
# 1. featureブランチで作業
git checkout develop && git pull
git checkout -b feature/xxx
# コード書く・コミット・push
git push origin feature/xxx
# → Vercelが個別Preview URLを発行

# 2. ステージングへ反映
git checkout develop
git merge feature/xxx
git push origin develop
# → Staging URL更新

# 3. 本番リリース
git checkout main
git merge develop
git push origin main
# → Production URL更新
```

## 運用上のメモ

- 写真・手書き数字は全てブラウザ内で処理する設計（サーバー送信しない）
- Vercel Hobbyプランで運用中。商用要素（広告・課金等）を入れる場合は要プラン変更 or 別ホスティング移行
