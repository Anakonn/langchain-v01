---
translated: true
---

# Airtable

>[Airtable](https://en.wikipedia.org/wiki/Airtable)は、クラウド上でのコラボレーションサービスです。
`Airtable`は、スプレッドシートとデータベースの特徴を併せ持つハイブリッドツールです。
>Airtableのテーブル内のフィールドは、スプレッドシートの細胞に似ていますが、'チェックボックス'、'電話番号'、'ドロップダウンリスト'などのデータ型を持ち、画像などのファイル添付も可能です。

>ユーザーはデータベースを作成し、列のタイプを設定し、レコードを追加し、テーブル間のリンクを設定し、共同作業を行い、レコードをソートし、外部のウェブサイトに公開したビューを表示することができます。

## インストールとセットアップ

```bash
pip install pyairtable
```

* [API key](https://support.airtable.com/docs/creating-and-using-api-keys-and-access-tokens)を取得してください。
* [ベースのID](https://airtable.com/developers/web/api/introduction)を取得してください。
* [テーブルのURLからテーブルID](https://www.highviewapps.com/kb/where-can-i-find-the-airtable-base-id-and-table-id/#:~:text=Both%20the%20Airtable%20Base%20ID,URL%20that%20begins%20with%20tbl)を取得してください。

## ドキュメントローダー

```python
<!--IMPORTS:[{"imported": "AirtableLoader", "source": "langchain_community.document_loaders", "docs": "https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.airtable.AirtableLoader.html", "title": "Airtable"}]-->
from langchain_community.document_loaders import AirtableLoader
```

[例](/docs/integrations/document_loaders/airtable)を参照してください。
