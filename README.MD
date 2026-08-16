# cha-han

スマートフォンを中華鍋に見立て、端末を振る動作で米粒を返す練習をするブラウザ・シミュレーターです。構想と段階的な目標は [idea.md](idea.md) にあります。

## すぐに試す

依存パッケージやビルドは不要です。HTTPS で公開された `release/index.html` をスマートフォンで開き、**センサーを有効にする**を押してください。PC では画面の左右ボタン、または <kbd>←</kbd> / <kbd>→</kbd> キーで動作を確認できます。

ローカルでは次のように配信します。

```sh
python3 -m http.server 4173
# http://localhost:4173/release/ を開く
```

> 端末センサーは原則として HTTPS または localhost の secure context が必要です。

## ディレクトリ

| パス | 用途 |
| --- | --- |
| `progs/cha-han.html` | 編集対象の単一ファイルアプリ |
| `release/index.html` | GitHub Pages に公開する生成済み成果物 |
| `models/` | 今後追加する鍋形状、粒子、卵などのモデルと仕様 |
| `docs/` | 開発記録と運用資料 |
| `scripts/` | ビルド・静的チェック |

## 開発

```sh
./scripts/build.sh  # progs/cha-han.html を release/index.html に反映
./scripts/check.sh  # 構成と単一 HTML の基本チェック
```

公開方法は [docs/github-pages.md](docs/github-pages.md)、判断履歴は [docs/devlog.md](docs/devlog.md) を参照してください。

## 現在の範囲

これは成立性を確かめる最初の 2D プロトタイプです。実機ごとの軸補正、正しい一振りの認識、実鍋に基づく物理モデル、卵や音声評価は今後の課題です。端末を落とさないよう、周囲を確認して両手で安全に操作してください。
