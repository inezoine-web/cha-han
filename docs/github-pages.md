# GitHub Pages publishing

このリポジトリは `.github/workflows/pages.yml` により `release/` だけを GitHub Pages へ公開します。

## 初回設定

1. リポジトリを GitHub へ push する。
2. GitHub の **Settings → Pages → Build and deployment → Source** で **GitHub Actions** を選ぶ。
3. 既定ブランチへ push するか、Actions の **Deploy GitHub Pages** を手動実行する。
4. Actions の `deploy` job が成功したら、同じ Pages 画面に表示される URL を開く。

Workflow には Pages への書き込み権限と同時デプロイ防止が設定されています。公開前の `check` job は、成果物が編集元と一致し、外部 JavaScript/CSS に依存しないことを検査します。

## 更新手順

```sh
# progs/cha-han.html を編集した後
./scripts/build.sh
./scripts/check.sh
git add progs/cha-han.html release/index.html docs/devlog.md
git commit -m "Describe the change"
git push
```

`release/index.html` を直接直すと次回ビルドで失われます。必ず `progs/cha-han.html` を編集してください。

## センサー確認時の注意

- DeviceMotion は HTTPS の公開 URL で確認する（localhost はローカル確認用の例外）。
- iOS ではユーザー操作から権限ダイアログを開く必要がある。
- Android/iOS と端末の向きによって軸が異なるため、画面のセンサー値も合わせて記録する。
- 実機を振る際はケースを装着し、周囲に十分な空間を確保する。

## トラブルシューティング

- Workflow が起動しない: workflow が既定ブランチにあり、Pages の Source が GitHub Actions か確認する。
- 403 になる: リポジトリの Actions 設定と workflow の `pages: write` / `id-token: write` 権限を確認する。
- センサーが「利用不可」になる: HTTPS、ブラウザ対応、OS のモーションアクセス設定を確認する。PC では左右ボタンで代替確認できる。
