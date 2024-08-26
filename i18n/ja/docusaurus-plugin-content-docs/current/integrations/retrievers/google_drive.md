---
translated: true
---

# Google Drive

このノートブックでは、`Google Drive`からドキュメントを取得する方法について説明します。

## 前提条件

1. Google Cloudプロジェクトを作成するか、既存のプロジェクトを使用する
1. [Google Drive API](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com)を有効にする
1. [デスクトップアプリの認証資格情報を取得する](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## Google Docsの取得

デフォルトでは、`GoogleDriveRetriever`は`~/.credentials/credentials.json`ファイルを期待しますが、`GOOGLE_ACCOUNT_FILE`環境変数を使用して設定できます。
`token.json`の場所は同じディレクトリを使用します(または`token_path`パラメーターを使用します)。`token.json`は、リトリーバーを最初に使用するときに自動的に作成されます。

`GoogleDriveRetriever`は、いくつかのリクエストでファイルの選択を取得できます。

デフォルトでは、`folder_id`を使用する場合、このフォルダー内のすべてのファイルを`Document`に取得できます。

フォルダーとドキュメントのIDはURLから取得できます:

* フォルダー: https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> フォルダーIDは`"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"`
* ドキュメント: https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> ドキュメントIDは`"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"`

特殊な値`root`は個人のホームを表します。

```python
from langchain_googledrive.retrievers import GoogleDriveRetriever

folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'

retriever = GoogleDriveRetriever(
    num_results=2,
)
```

デフォルトでは、これらのMIMEタイプのすべてのファイルを`Document`に変換できます。

- `text/text`
- `text/plain`
- `text/html`
- `text/csv`
- `text/markdown`
- `image/png`
- `image/jpeg`
- `application/epub+zip`
- `application/pdf`
- `application/rtf`
- `application/vnd.google-apps.document` (GDoc)
- `application/vnd.google-apps.presentation` (GSlide)
- `application/vnd.google-apps.spreadsheet` (GSheet)
- `application/vnd.google.colaboratory` (Notebook colab)
- `application/vnd.openxmlformats-officedocument.presentationml.presentation` (PPTX)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)

これを更新またはカスタマイズすることができます。`GoogleDriveRetriever`のドキュメントを参照してください。

ただし、対応するパッケージがインストールされている必要があります。

```python
%pip install --upgrade --quiet  unstructured
```

```python
retriever.invoke("machine learning")
```

ファイルを選択するための基準をカスタマイズできます。事前定義されたフィルターのセットが提案されています:

| テンプレート                              | 説明                                                           |
| --------------------------------------   | --------------------------------------------------------------------- |
| `gdrive-all-in-folder`                   | `folder_id`からすべての互換ファイルを返す                        |
| `gdrive-query`                           | すべてのドライブで`query`を検索                                  |
| `gdrive-by-name`                         | 名前が`query`のファイルを検索                                   |
| `gdrive-query-in-folder`                 | `folder_id`(および`_recursive=true`のサブフォルダー)で`query`を検索 |
| `gdrive-mime-type`                       | 特定の`mime_type`を検索                                         |
| `gdrive-mime-type-in-folder`             | `folder_id`内の特定の`mime_type`を検索                          |
| `gdrive-query-with-mime-type`            | 特定の`mime_type`で`query`を検索                                |
| `gdrive-query-with-mime-type-and-folder` | 特定の`mime_type`と`folder_id`で`query`を検索                   |

```python
retriever = GoogleDriveRetriever(
    template="gdrive-query",  # Search everywhere
    num_results=2,  # But take only 2 documents
)
for doc in retriever.invoke("machine learning"):
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

また、専用の`PromptTemplate`を使ってプロンプトをカスタマイズすることもできます。

```python
from langchain_core.prompts import PromptTemplate

retriever = GoogleDriveRetriever(
    template=PromptTemplate(
        input_variables=["query"],
        # See https://developers.google.com/drive/api/guides/search-files
        template="(fullText contains '{query}') "
        "and mimeType='application/vnd.google-apps.document' "
        "and modifiedTime > '2000-01-01T00:00:00' "
        "and trashed=false",
    ),
    num_results=2,
    # See https://developers.google.com/drive/api/v3/reference/files/list
    includeItemsFromAllDrives=False,
    supportsAllDrives=False,
)
for doc in retriever.invoke("machine learning"):
    print(f"{doc.metadata['name']}:")
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

## Google Driveの'description'メタデータの使用

Google Driveの各ファイルには、メタデータに`description`フィールドがあります(ファイルの*詳細*を参照)。
`snippets`モードを使用して、選択したファイルの説明を返すことができます。

```python
retriever = GoogleDriveRetriever(
    template="gdrive-mime-type-in-folder",
    folder_id=folder_id,
    mime_type="application/vnd.google-apps.document",  # Only Google Docs
    num_results=2,
    mode="snippets",
    includeItemsFromAllDrives=False,
    supportsAllDrives=False,
)
retriever.invoke("machine learning")
```
