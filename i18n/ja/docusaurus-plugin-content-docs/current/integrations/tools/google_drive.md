---
translated: true
---

# Google Drive

このノートブックでは、`Google Drive API`に LangChain を接続する方法を説明します。

## 前提条件

1. Google Cloud プロジェクトを作成するか、既存のプロジェクトを使用する
1. [Google Drive API](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com)を有効にする
1. [デスクトップアプリの認証情報を承認する](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## Google ドキュメントデータを取得する手順

デフォルトでは、`GoogleDriveTools`と`GoogleDriveWrapper`は`~/.credentials/credentials.json`ファイルを期待しますが、`GOOGLE_ACCOUNT_FILE`環境変数を使用して構成できます。
`token.json`の場所は同じディレクトリを使用します(または`token_path`パラメーターを使用します)。`token.json`は、ツールを初めて使用するときに自動的に作成されます。

`GoogleDriveSearchTool`は、いくつかのリクエストでファイルの選択を取得できます。

デフォルトでは、`folder_id`を使用する場合、このフォルダー内のすべてのファイルが`Document`に取得されます(名前がクエリと一致する場合)。

```python
%pip install --upgrade --quiet  google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

フォルダーとドキュメントの ID は、URL から取得できます:

* フォルダー: https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> フォルダー ID は `"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"`
* ドキュメント: https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> ドキュメント ID は `"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"`

特別な値 `root` は、個人のホームディレクトリを表します。

```python
folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'
```

デフォルトでは、これらの mime タイプのすべてのファイルを `Document` に変換できます。
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

これらは更新または カスタマイズ可能です。`GoogleDriveAPIWrapper`のドキュメントを参照してください。

ただし、対応するパッケージがインストールされている必要があります。

```python
%pip install --upgrade --quiet  unstructured
```

```python
from langchain_googldrive.tools.google_drive.tool import GoogleDriveSearchTool
from langchain_googledrive.utilities.google_drive import GoogleDriveAPIWrapper

# By default, search only in the filename.
tool = GoogleDriveSearchTool(
    api_wrapper=GoogleDriveAPIWrapper(
        folder_id=folder_id,
        num_results=2,
        template="gdrive-query-in-folder",  # Search in the body of documents
    )
)
```

```python
import logging

logging.basicConfig(level=logging.INFO)
```

```python
tool.run("machine learning")
```

```python
tool.description
```

```python
from langchain.agents import load_tools

tools = load_tools(
    ["google-drive-search"],
    folder_id=folder_id,
    template="gdrive-query-in-folder",
)
```

## エージェントで使用する

```python
from langchain.agents import AgentType, initialize_agent
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
)
```

```python
agent.run("Search in google drive, who is 'Yann LeCun' ?")
```
