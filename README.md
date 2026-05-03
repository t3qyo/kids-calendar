# Kids Calendar Maker

子供の写真と手書き数字でつくる、世界に一つだけのカレンダーWebアプリ。

## 機能

- 12ヶ月分の写真アップロード（開始月・年は任意）
- 子供の手書き数字（0〜9）を取り込んで日付に使用
- 卓上縦・卓上横・壁かけの3レイアウト
- 写真の表示範囲（位置・拡大率）の調整
- PDF / PNG での出力

## 開発

```bash
yarn install
yarn dev
# http://localhost:3010
```

## デプロイ

| ブランチ | 環境 | URL |
|---|---|---|
| `main` | Production | https://kids-calendar-blue.vercel.app |
| `develop` | Staging (Preview) | Vercelが自動発行 |
| `feature/*` | 個別Preview | PR/ブランチごとに自動発行 |

### フロー

```
feature/xxx → develop (動作確認) → main (本番)
```
