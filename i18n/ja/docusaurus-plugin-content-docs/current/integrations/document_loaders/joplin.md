---
translated: true
---

# Joplin

>[Joplin](https://joplinapp.org/)は、オープンソースのノートアプリです。考えを捉え、どのデバイスからでも安全にアクセスできます。

このノートブックでは、`Joplin`データベースからドキュメントを読み込む方法を説明します。

`Joplin`には、ローカルデータベースにアクセスするための[REST API](https://joplinapp.org/api/references/rest_api/)があります。このローダーは、APIを使用してデータベース内のすべてのノートとそのメタデータを取得します。これには、アプリから取得できるアクセストークンが必要です。

1. `Joplin`アプリを開きます。ドキュメントの読み込み中はアプリを開いたままにする必要があります。
2. 設定/オプションに移動し、「Webクリッパー」を選択します。
3. Webクリッパーサービスが有効になっていることを確認します。
4. 「詳細オプション」の下で、認証トークンをコピーします。

ローダーを直接アクセストークンで初期化するか、環境変数JOPLIN_ACCESS_TOKENに保存することができます。

この方法の代替案は、`Joplin`のノートデータベースをMarkdownファイル(オプションでフロントマターメタデータ付き)にエクスポートし、ObsidianLoaderなどのMarkdownローダーを使用してそれらをロードすることです。

```python
from langchain_community.document_loaders import JoplinLoader
```

```python
loader = JoplinLoader(access_token="<access-token>")
```

```python
docs = loader.load()
```
