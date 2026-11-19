# Cloudtyper

**Cloudtyper** は、AWS CLI・Terraform・Linux などのコマンドをタイピングしながら学習できるWebアプリケーションです。

クラウドエンジニアに必要なコマンドを、ゲーム感覚で楽しく練習できることを目指して開発しました。

## アプリケーション画面

<!-- アプリケーションのスクリーンショットを追加 -->
<!-- 例：![Cloudtyper](./images/cloudtyper.png) -->

## デモ動画

<!-- デモ動画のURLを追加 -->

## 主な機能

- **レベル別の練習**：初級・中級・上級からレベルを選択
- **コマンド練習**：AWS CLI・Terraform・Linux のコマンドをタイピング
- **タイピング結果の表示**：WPM・正確率・ミス数・経過時間を表示
- **ユーザー認証**：Supabase Auth によるログイン機能
- **学習履歴の保存**：ログインユーザーの練習結果をデータベースに保存
- **ゲスト利用**：ログインせずにタイピング練習が可能

## 使用技術

| 分類 | 技術 |
|---|---|
| Frontend | React / TypeScript / Vite |
| Backend / BaaS | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Development Tool | VS Code / Git / GitHub |

## ディレクトリ構成

```text
Cloudtyper/
├── backend/
│   └── supabase/
│       ├── schema.sql
│       └── seed_challenges.sql
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
└── .gitignore
```

## 開発の目的

AWSやTerraformを学習する中で、コマンドを実際に入力しながら覚えられるツールがあれば便利だと考え、Cloudtyperを開発しました。

単にコマンドを暗記するだけでなく、繰り返し練習することで、コマンドの入力速度と正確性を高めることを目指しています。

## 今後の改善予定

- 練習できるコマンドの追加
- 学習履歴や成績の可視化
- UI・操作性の改善
- キャラクターを使った学習体験の追加