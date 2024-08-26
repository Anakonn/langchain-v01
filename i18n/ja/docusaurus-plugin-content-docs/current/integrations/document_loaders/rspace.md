---
translated: true
---

このノートブックでは、RSpace ドキュメントローダーを使用して、RSpace 電子ラボノートブックからリサーチノートとドキュメントを Langchain パイプラインにインポートする方法を示します。

開始するには、RSpace アカウントと API キーが必要です。

[https://community.researchspace.com](https://community.researchspace.com) で無料アカウントを設定するか、所属機関の RSpace を使用できます。

RSpace API トークンは、アカウントのプロファイルページから取得できます。

```python
%pip install --upgrade --quiet  rspace_client
```

RSpace API キーは環境変数として保存するのが最適です。

    RSPACE_API_KEY=<YOUR_KEY>

また、RSpace インストールの URL も設定する必要があります。例:

    RSPACE_URL=https://community.researchspace.com

これらの環境変数名を使用すると、自動的に検出されます。

```python
from langchain_community.document_loaders.rspace import RSpaceLoader
```

RSpace から以下のようなアイテムをインポートできます:

* 単一の RSpace 構造化または基本ドキュメント。これは 1 対 1 で Langchain ドキュメントにマッピングされます。
* フォルダーまたはノートブック。ノートブックやフォルダー内のすべてのドキュメントが Langchain ドキュメントとしてインポートされます。
* RSpace ギャラリーに PDF ファイルがある場合、個別にインポートできます。内部では Langchain の PDF ローダーが使用され、PDF ページごとに 1 つの Langchain ドキュメントが作成されます。

```python
## replace these ids with some from your own research notes.
## Make sure to use  global ids (with the 2 character prefix). This helps the loader know which API calls to make
## to RSpace API.

rspace_ids = ["NB1932027", "FL1921314", "SD1932029", "GL1932384"]
for rs_id in rspace_ids:
    loader = RSpaceLoader(global_id=rs_id)
    docs = loader.load()
    for doc in docs:
        ## the name and ID are added to the 'source' metadata property.
        print(doc.metadata)
        print(doc.page_content[:500])
```

上記の環境変数を使用したくない場合は、RSpaceLoader に直接渡すこともできます。

```python
loader = RSpaceLoader(
    global_id=rs_id, api_key="MY_API_KEY", url="https://my.researchspace.com"
)
```
