---
translated: true
---

# lakeFS

>[lakeFS](https://docs.lakefs.io/)は、データレイクに対するスケーラブルなバージョン管理を提供し、Gitのようなセマンティクスを使ってそれらのバージョンを作成およびアクセスします。

このノートブックでは、`lakeFS`パス(オブジェクトまたはプレフィックス)からドキュメントオブジェクトをロードする方法を説明します。

## lakeFS ローダーの初期化

`ENDPOINT`、`LAKEFS_ACCESS_KEY`、および`LAKEFS_SECRET_KEY`の値を自分のものに置き換えてください。

```python
from langchain_community.document_loaders import LakeFSLoader
```

```python
ENDPOINT = ""
LAKEFS_ACCESS_KEY = ""
LAKEFS_SECRET_KEY = ""

lakefs_loader = LakeFSLoader(
    lakefs_access_key=LAKEFS_ACCESS_KEY,
    lakefs_secret_key=LAKEFS_SECRET_KEY,
    lakefs_endpoint=ENDPOINT,
)
```

## パスの指定

ファイルをロードするファイルを制御するために、プレフィックスまたは完全なオブジェクトパスを指定できます。

リポジトリ、リファレンス(ブランチ、コミットID、またはタグ)、およびパスを対応する`REPO`、`REF`、および`PATH`で指定して、ドキュメントをロードします:

```python
REPO = ""
REF = ""
PATH = ""

lakefs_loader.set_repo(REPO)
lakefs_loader.set_ref(REF)
lakefs_loader.set_path(PATH)

docs = lakefs_loader.load()
docs
```
