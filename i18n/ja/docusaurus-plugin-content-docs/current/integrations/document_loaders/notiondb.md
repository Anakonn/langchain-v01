---
translated: true
---

# Notion DB 2/2

>[Notion](https://www.notion.so/)は、カンバンボード、タスク、ウィキ、データベースを統合した共同作業プラットフォームで、修正されたMarkdownをサポートしています。ノートテイキング、知識とデータ管理、プロジェクトとタスク管理のための総合的なワークスペースです。

`NotionDBLoader`は、`Notion`データベースからコンテンツを読み込むためのPythonクラスです。データベースからページを取得し、コンテンツを読み取り、Document objectsのリストを返します。

## 要件

- `Notion`データベース
- Notion Integration Token

## セットアップ

### 1. Notion テーブルデータベースの作成

Notionに新しいテーブルデータベースを作成します。データベースに任意の列を追加することができ、それらはメタデータとして扱われます。例えば、次のような列を追加できます:

- Title: デフォルトのプロパティとして設定します。
- Categories: ページに関連付けられたカテゴリを格納するMulti-select プロパティ。
- Keywords: ページに関連付けられたキーワードを格納するMulti-select プロパティ。

各ページのボディにコンテンツを追加します。NotionDBLoaderはこれらのページからコンテンツとメタデータを抽出します。

## 2. Notion Integrationの作成

Notion Integrationを作成するには、以下の手順に従います:

1. [Notion Developers](https://www.notion.com/my-integrations)ページにアクセスし、Notion アカウントでログインします。
2. "+ New integration"ボタンをクリックします。
3. インテグレーションに名前を付け、データベースが存在するワークスペースを選択します。
4. 必要な機能を選択します。この拡張機能は、コンテンツの読み取り機能のみが必要です。
5. "Submit"ボタンをクリックしてインテグレーションを作成します。
インテグレーションが作成されると、`Integration Token (API key)`が提供されます。このトークンをコピーして安全に保管してください。NotionDBLoaderを使用するときに必要になります。

### 3. データベースにIntegrationを接続する

Integrationをデータベースに接続するには、以下の手順に従います:

1. Notionでデータベースを開きます。
2. データベースビューの右上にある3つのドットメニューアイコンをクリックします。
3. "+ New integration"ボタンをクリックします。
4. 検索ボックスにインテグレーションの名前を入力して見つけます。
5. "Connect"ボタンをクリックしてインテグレーションをデータベースに接続します。

### 4. データベースIDの取得

データベースIDを取得するには、以下の手順に従います:

1. Notionでデータベースを開きます。
2. データベースビューの右上にある3つのドットメニューアイコンをクリックします。
3. メニューから"Copy link"を選択して、データベースのURLをクリップボードにコピーします。
4. データベースIDは、URLに含まれる長い英数字の文字列です。通常、次のように表示されます: https://www.notion.so/username/8935f9d140a04f95a872520c4f123456?v=.... この例では、データベースIDは8935f9d140a04f95a872520c4f123456です。

データベースが適切に設定され、インテグレーショントークンとデータベースIDが手に入ったら、NotionDBLoaderコードを使ってNotionデータベースからコンテンツとメタデータを読み込むことができます。

## 使用方法

NotionDBLoaderはlangchainパッケージのドキュメントローダーの一部です。以下のように使用できます:

```python
from getpass import getpass

NOTION_TOKEN = getpass()
DATABASE_ID = getpass()
```

```output
········
········
```

```python
from langchain_community.document_loaders import NotionDBLoader
```

```python
loader = NotionDBLoader(
    integration_token=NOTION_TOKEN,
    database_id=DATABASE_ID,
    request_timeout_sec=30,  # optional, defaults to 10
)
```

```python
docs = loader.load()
```

```python
print(docs)
```
