# Shukatsu Quest Back-end

このプロジェクトは、就活をゲーム感覚で進めるためのバックエンドシステムです。  
Supabase を利用して、データベース、認証、Edge Functions などを構成しています。


## 1. 環境変数の設定

プロジェクトルートに **.env** ファイルを作成し、以下のキーを設定してください。

```dotenv
DATABASE_API_URL=<Supabase の API エンドポイント (例: https://your-project.supabase.co)>
DATABASE_API_KEY=<Supabase の API キー (Anon Key など)>
GEMINI_API_KEY=<Gemini の API キー>
GEMINI_MODEL=<Gemini のモデル名 (例: models/chat-bison-001)>
```

※ この .env はバックエンドの設定に使用します。

## 2. データベースのテーブル設定

本プロジェクトでは、以下のようなテーブル構成を利用しています。
※ 実際のデータ型やリレーションは、Supabase Dashboard や SQL スクリプトにて適宜設定してください。

2.1 users テーブル
	•	id: UUID（プライマリキー）
	•	lv: ユーザーレベル（整数型）
	•	exp: 経験値（整数型）
	•	auth_user_id: Supabase Auth のユーザーIDとの紐付け（UUID）
	•	name: ユーザー名（テキスト型）

2.2 achievements テーブル
	•	id: UUID（プライマリキー）
	•	user_id: users テーブルの id（UUID）
	•	quest_id: quests テーブルの id（UUID）
	•	cleared_at: クエストクリア日時（タイムスタンプ）

2.3 quests テーブル
	•	id: UUID（プライマリキー）
	•	stage_id: stages テーブルの id（UUID）
	•	name: クエスト名（テキスト型）
	•	number: クエスト番号（整数型）
	•	base_exp: 獲得経験値（整数型）
	•	type: クエストの種類（テキスト型）

2.4 stages テーブル
	•	id: UUID（プライマリキー）
	•	name: ステージ名（テキスト型）
	•	number: ステージ番号（整数型）

2.5 es_evaluations テーブル
	•	id: UUID（プライマリキー）
	•	es_id: ESデータのID（UUID）
	•	user_id: users テーブルの id（UUID）
	•	category: 評価カテゴリー（テキスト型）
	•	full_score: カテゴリーごとの満点（整数型）
	•	score: 実際のスコア（整数型）
	•	answer: ユーザーの回答（テキスト型）
	•	length: 回答の文字数（整数型）
	•	written_at: 回答日時（タイムスタンプ）
	•	correction: 添削結果（テキスト型）
	•	correction_comment: 添削コメント（テキスト型）
	•	comment: 総合評価コメント（テキスト型）

※ 各テーブル間のリレーションは、Supabase のリレーション機能を利用して設定してください。

⸻

## 3. プロジェクトの起動方法

3.1 リポジトリのクローン

```bash
git clone https://github.com/IkkiKyomoto/shukatsu-quest-back-end.git
cd shukatsu-quest-back-end
```
3.2 Supabase CLI のインストール

macOS の場合（Homebrew）:

brew install supabase/tap/supabase

※ 他の OS の場合は Supabase CLI の公式ドキュメント を参照してください。

3.3 Supabase プロジェクトの初期化

プロジェクトディレクトリ内で、以下のコマンドを実行して初期化します。
```bash
supabase init
```

これにより、supabase ディレクトリと各種設定ファイル（例: config.toml）が生成されます。

3.4 ローカルサーバーの起動

Supabase のローカル環境を起動します。

```bash
supabase start
```

これで、ローカルの PostgreSQL、Auth、Storage などが起動します。

3.5 Edge Functions の起動

Edge Functions をローカルで動作させるには、以下のコマンドを実行してください。

```bash
supabase functions serve
```

※ ファイル変更時に自動再起動（ホットリロード）されます。
※ 開発中に JWT 認証を無効化したい場合は、--no-verify-jwt オプションを利用できます。

⸻

以上の手順で、Supabase プロジェクトとデータベース、Edge Functions のローカル環境が起動し、開発・テストが可能となります。

