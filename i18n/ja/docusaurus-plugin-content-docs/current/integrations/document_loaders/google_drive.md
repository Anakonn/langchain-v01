---
translated: true
---

# Google Drive

>[Google Drive](https://en.wikipedia.org/wiki/Google_Drive)は、Googleが開発したファイル保存およびシンクロ化サービスです。

このノートブックでは、`Google Drive`からドキュメントをロードする方法を説明します。現在、`Google Docs`のみがサポートされています。

## 前提条件

1. Google Cloudプロジェクトを作成するか、既存のプロジェクトを使用する
1. [Google Drive API](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com)を有効化する
1. [デスクトップアプリの認証情報を承認する](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## 🧑 Google Docsデータを取り込むための手順

環境変数`GOOGLE_APPLICATION_CREDENTIALS`を空の文字列(`""`)に設定します。

デフォルトでは、`GoogleDriveLoader`は`~/.credentials/credentials.json`にある`credentials.json`ファイルを期待しますが、`credentials_path`キーワード引数を使用して設定できます。`token.json`についても同様で、デフォルトのパスは`~/.credentials/token.json`、コンストラクタパラメータは`token_path`です。

`GoogleDriveLoader`を初めて使用する場合、ブラウザでユーザー認証の同意画面が表示されます。認証後、`token.json`が提供されたパスまたはデフォルトのパスに自動的に作成されます。また、そのパスに既に`token.json`がある場合は、認証を求められません。

`GoogleDriveLoader`は、Google DocsドキュメントのリストまたはフォルダIDからロードできます。フォルダやドキュメントのIDはURLから取得できます:

* フォルダ: https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> フォルダIDは`"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"`
* ドキュメント: https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> ドキュメントIDは`"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"`

```python
%pip install --upgrade --quiet langchain-google-community[drive]
```

```python
from langchain_google_community import GoogleDriveLoader
```

```python
loader = GoogleDriveLoader(
    folder_id="1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5",
    token_path="/path/where/you/want/token/to/be/created/google_token.json",
    # Optional: configure whether to recursively fetch files from subfolders. Defaults to False.
    recursive=False,
)
```

```python
docs = loader.load()
```

`folder_id`を渡すと、デフォルトではドキュメント、シート、PDFタイプのすべてのファイルがロードされます。`file_types`引数を渡すことで、この動作を変更できます。

```python
loader = GoogleDriveLoader(
    folder_id="1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5",
    file_types=["document", "sheet"],
    recursive=False,
)
```

## オプションのファイルローダーの渡し

Google DocsやGoogle Sheets以外のファイルを処理する場合は、オプションのファイルローダーを`GoogleDriveLoader`に渡すと便利です。ファイルローダーを渡すと、Google DocsやGoogle Sheetsのマイムタイプではないドキュメントに使用されます。ここでは、ファイルローダーを使ってGoogle DriveからExcelドキュメントをロードする例を示します。

```python
from langchain_community.document_loaders import UnstructuredFileIOLoader
from langchain_google_community import GoogleDriveLoader
```

```python
file_id = "1x9WBtFPWMEAdjcJzPScRsjpjQvpSo_kz"
loader = GoogleDriveLoader(
    file_ids=[file_id],
    file_loader_cls=UnstructuredFileIOLoader,
    file_loader_kwargs={"mode": "elements"},
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

フォルダ内にファイルとGoogle Docs/Sheetsが混在している場合は、次のパターンを使用できます。

```python
folder_id = "1asMOHY1BqBS84JcRbOag5LOJac74gpmD"
loader = GoogleDriveLoader(
    folder_id=folder_id,
    file_loader_cls=UnstructuredFileIOLoader,
    file_loader_kwargs={"mode": "elements"},
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

## 拡張機能

Google Driveの複雑さを管理する外部(非公式)コンポーネント`langchain-googledrive`があります。
これは`langchain_community.document_loaders.GoogleDriveLoader`と互換性があり、代替として使用できます。

コンテナ対応のために、認証には`GOOGLE_ACCOUNT_FILE`環境変数を使用してクレデンシャルファイル(ユーザーまたはサービス用)を指定します。

```python
%pip install --upgrade --quiet  langchain-googledrive
```

```python
folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'
```

```python
# Use the advanced version.
from langchain_googledrive.document_loaders import GoogleDriveLoader
```

```python
loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    num_results=2,  # Maximum number of file to load
)
```

デフォルトでは、次のマイムタイプのすべてのファイルが`Document`に変換されます。
- text/text
- text/plain
- text/html
- text/csv
- text/markdown
- image/png
- image/jpeg
- application/epub+zip
- application/pdf
- application/rtf
- application/vnd.google-apps.document (GDoc)
- application/vnd.google-apps.presentation (GSlide)
- application/vnd.google-apps.spreadsheet (GSheet)
- application/vnd.google.colaboratory (Notebook colab)
- application/vnd.openxmlformats-officedocument.presentationml.presentation (PPTX)
- application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX)

これらは更新または カスタマイズ可能です。`GDriveLoader`のドキュメントを参照してください。

ただし、対応するパッケージがインストールされている必要があります。

```python
%pip install --upgrade --quiet  unstructured
```

```python
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

### 認証アイデンティティのロード

Google Drive Loaderによってインジェストされた各ファイルの認証アイデンティティとメタデータを、Documentとともにロードできます。

```python
from langchain_google_community import GoogleDriveLoader

loader = GoogleDriveLoader(
    folder_id=folder_id,
    load_auth=True,
    # Optional: configure whether to load authorized identities for each Document.
)

doc = loader.load()
```

`load_auth=True`を渡すと、Google Driveドキュメントのアクセス権限アイデンティティがメタデータに追加されます。

```python
doc[0].metadata
```

### 拡張メタデータのロード

次の追加フィールドも、各Documentのメタデータ内で取得できます:
 - full_path - Google Driveでのファイルのフルパス
 - owner - ファイルの所有者
 - size - ファイルのサイズ

```python
from langchain_google_community import GoogleDriveLoader

loader = GoogleDriveLoader(
    folder_id=folder_id,
    load_extended_matadata=True,
    # Optional: configure whether to load extended metadata for each Document.
)

doc = loader.load()
```

`load_extended_matadata=True`を渡すと、Google Driveドキュメントの拡張詳細がメタデータに追加されます。

```python
doc[0].metadata
```

### 検索パターンのカスタマイズ

Google [`list()`](https://developers.google.com/drive/api/v3/reference/files/list) APIに対応するすべてのパラメーターを設定できます。

新しいパターンのGoogle リクエストを指定するには、`PromptTemplate()`を使用できます。
プロンプトの変数は、コンストラクターの `kwargs` で設定できます。
いくつかの事前フォーマットされたリクエストが提案されています (use `{query}`, `{folder_id}` and/or `{mime_type}`):

ファイルを選択する基準をカスタマイズできます。いくつかの事前定義されたフィルターが提案されています:

| テンプレート                           | 説明                                                           |
| -------------------------------------- | --------------------------------------------------------------------- |
| gdrive-all-in-folder                   | `folder_id`からすべての互換ファイルを返す                        |
| gdrive-query                           | すべてのドライブで `query` を検索                                |
| gdrive-by-name                         | 名前 `query` のファイルを検索                                  |
| gdrive-query-in-folder                 | `folder_id` (`recursive=true`の場合は下位フォルダーも)で `query` を検索 |
| gdrive-mime-type                       | 特定の `mime_type` を検索                                       |
| gdrive-mime-type-in-folder             | `folder_id` で特定の `mime_type` を検索                         |
| gdrive-query-with-mime-type            | 特定の `mime_type` で `query` を検索                           |
| gdrive-query-with-mime-type-and-folder | 特定の `mime_type` と `folder_id` で `query` を検索            |

```python
loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    template="gdrive-query",  # Default template to use
    query="machine learning",
    num_results=2,  # Maximum number of file to load
    supportsAllDrives=False,  # GDrive `list()` parameter
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

独自のパターンをカスタマイズできます。

```python
from langchain_core.prompts.prompt import PromptTemplate

loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    template=PromptTemplate(
        input_variables=["query", "query_name"],
        template="fullText contains '{query}' and name contains '{query_name}' and trashed=false",
    ),  # Default template to use
    query="machine learning",
    query_name="ML",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

変換はMarkdownフォーマットで管理できます:
- bullet
- link
- table
- titles

`return_link`属性を `True` に設定すると、リンクをエクスポートできます。

#### GSlideとGSheetのモード

パラメーターmodeは次の値を受け入れます:

- "document": 各ドキュメントの本文を返す
- "snippets": 各ファイルの説明(Google Driveファイルのメタデータで設定)を返す。

パラメーター `gslide_mode` は次の値を受け入れます:

- "single" : &lt;PAGE BREAK&gt;付きの1つのドキュメント
- "slide" : スライドごとに1つのドキュメント
- "elements" : 各要素ごとに1つのドキュメント。

```python
loader = GoogleDriveLoader(
    template="gdrive-mime-type",
    mime_type="application/vnd.google-apps.presentation",  # Only GSlide files
    gslide_mode="slide",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

パラメーター `gsheet_mode` は次の値を受け入れます:
- `"single"`: 行ごとに1つのドキュメントを生成
- `"elements"` : Markdownの配列と&lt;PAGE BREAK&gt;タグ付きの1つのドキュメント。

```python
loader = GoogleDriveLoader(
    template="gdrive-mime-type",
    mime_type="application/vnd.google-apps.spreadsheet",  # Only GSheet files
    gsheet_mode="elements",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

### 高度な使用法

すべてのGoogleファイルにはメタデータの 'description' フィールドがあります。このフィールドを使用して、ドキュメントの要約や他のインデックス付きのタグを記憶できます (メソッド `lazy_update_description_with_summary()` を参照)。

`mode="snippet"`を使用する場合、説明のみが本文に使用されます。それ以外の場合、`metadata['summary']`にフィールドがあります。

特定のフィルターを使用して、ファイル名から情報を抽出し、特定の基準でファイルを選択することもできます。フィルターを使用できます。

多くのドキュメントが返される場合があります。メモリ上にすべてのドキュメントを保持する必要はありません。遅延バージョンのメソッドを使用して、1つのドキュメントずつ取得できます。 `recursive=True`を有効にする場合は、複雑なクエリを使用するのが better です。各フォルダーに対してクエリを適用する必要があります。

```python
import os

loader = GoogleDriveLoader(
    gdrive_api_file=os.environ["GOOGLE_ACCOUNT_FILE"],
    num_results=2,
    template="gdrive-query",
    filter=lambda search, file: "#test" not in file.get("description", ""),
    query="machine learning",
    supportsAllDrives=False,
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```
