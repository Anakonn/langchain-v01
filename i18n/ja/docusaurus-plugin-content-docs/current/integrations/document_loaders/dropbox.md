---
translated: true
---

# Dropbox

[Dropbox](https://en.wikipedia.org/wiki/Dropbox)は、従来のファイル、クラウドコンテンツ、Webショートカットを1つの場所に集めるファイルホスティングサービスです。

このノートブックでは、*Dropbox*からドキュメントをロードする方法を説明します。テキストやPDFファイルなどの一般的なファイルに加えて、*Dropbox Paper*ファイルもサポートしています。

## 前提条件

1. Dropboxアプリを作成する。
2. アプリに`files.metadata.read`と`files.content.read`のスコープ権限を与える。
3. アクセストークンを生成する: https://www.dropbox.com/developers/apps/create。
4. `pip install dropbox`(PDFファイルタイプには`pip install "unstructured[pdf]"`が必要)。

## 手順

`DropboxLoader`を使うには、Dropboxアプリを作成してアクセストークンを生成する必要があります。これは https://www.dropbox.com/developers/apps/create から行えます。また、Dropbox Python SDKがインストールされている必要があります(pip install dropbox)。

DropboxLoaderは、Dropboxファイルパスのリストまたは単一のDropboxフォルダパスからデータをロードできます。どちらのパスもDropboxアカウントのルートディレクトリからの相対パスである必要があります。

```python
pip install dropbox
```

```output
Requirement already satisfied: dropbox in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (11.36.2)
Requirement already satisfied: requests>=2.16.2 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from dropbox) (2.31.0)
Requirement already satisfied: six>=1.12.0 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from dropbox) (1.16.0)
Requirement already satisfied: stone>=2 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from dropbox) (3.3.1)
Requirement already satisfied: charset-normalizer<4,>=2 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (3.2.0)
Requirement already satisfied: idna<4,>=2.5 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (3.4)
Requirement already satisfied: urllib3<3,>=1.21.1 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (2.0.4)
Requirement already satisfied: certifi>=2017.4.17 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (2023.7.22)
Requirement already satisfied: ply>=3.4 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from stone>=2->dropbox) (3.11)
Note: you may need to restart the kernel to use updated packages.
```

```python
from langchain_community.document_loaders import DropboxLoader
```

```python
# Generate access token: https://www.dropbox.com/developers/apps/create.
dropbox_access_token = "<DROPBOX_ACCESS_TOKEN>"
# Dropbox root folder
dropbox_folder_path = ""
```

```python
loader = DropboxLoader(
    dropbox_access_token=dropbox_access_token,
    dropbox_folder_path=dropbox_folder_path,
    recursive=False,
)
```

```python
documents = loader.load()
```

```output
File /JHSfLKn0.jpeg could not be decoded as text. Skipping.
File /A REPORT ON WILES’ CAMBRIDGE LECTURES.pdf could not be decoded as text. Skipping.
```

```python
for document in documents:
    print(document)
```
