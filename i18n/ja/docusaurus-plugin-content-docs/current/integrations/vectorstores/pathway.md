---
translated: true
---

# パスウェイ

> [パスウェイ](https://pathway.com/)は、オープンデータ処理フレームワークです。ライブデータソースや変化するデータを使って、データ変換パイプラインやマシンラーニングアプリケーションを簡単に開発できます。

このノートブックでは、`Langchain`を使ってライブ`パスウェイ`データインデックスパイプラインを使う方法を示します。このパイプラインの結果をチェーンから同じ方法でベクトルストアにクエリできます。ただし、パスウェイは各データ変更時にインデックスを更新するため、常に最新の回答が得られます。

このノートブックでは、以下のような[公開デモドキュメント処理パイプライン](https://pathway.com/solutions/ai-pipelines#try-it-out)を使用します:

1. 複数のクラウドデータソースのデータ変更を監視します。
2. データのベクトルインデックスを構築します。

独自のドキュメント処理パイプラインを持つには、[ホスティングサービス](https://pathway.com/solutions/ai-pipelines)を利用するか、[自分で構築](https://pathway.com/developers/user-guide/llm-xpack/vectorstore_pipeline/)する必要があります。

`VectorStore`クライアントを使ってインデックスに接続し、`similarity_search`関数を呼び出してマッチするドキュメントを取得します。

このドキュメントで使用されているベーシックなパイプラインは、クラウド上のファイルにシンプルなベクトルインデックスを簡単に構築できます。ただし、パスウェイにはグループ化や結合、時間ベースのグループ化やウィンドウ処理など、SQLライクな操作や、さまざまなコネクタも用意されています。

## データパイプラインのクエリ

クライアントをインスタンス化して設定するには、ドキュメントインデックスパイプラインの`url`または`host`と`port`を指定する必要があります。以下のコードでは、[公開デモパイプライン](https://pathway.com/solutions/ai-pipelines#try-it-out)を使用しています。このデモは[Google Drive](https://drive.google.com/drive/u/0/folders/1cULDv2OaViJBmOfG5WB0oWcgayNrGtVs)と[Sharepoint](https://navalgo.sharepoint.com/sites/ConnectorSandbox/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FConnectorSandbox%2FShared%20Documents%2FIndexerSandbox&p=true&ga=1)からドキュメントをインジェストし、ドキュメントの検索インデックスを維持しています。

```python
from langchain_community.vectorstores import PathwayVectorClient

client = PathwayVectorClient(url="https://demo-document-indexing.pathway.stream")
```

クエリを開始できます。

```python
query = "What is Pathway?"
docs = client.similarity_search(query)
```

```python
print(docs[0].page_content)
```

**あなたの番です!** [自分のパイプラインを取得](https://pathway.com/solutions/ai-pipelines)するか、[新しいドキュメントをデモパイプラインにアップロード](https://chat-realtime-sharepoint-gdrive.demo.pathway.com/)して、クエリを再試行してください!

## ファイルメタデータによるフィルタリング

[jmespath](https://jmespath.org/)式を使ってドキュメントをフィルタリングできます。例:

```python
# take into account only sources modified later than unix timestamp
docs = client.similarity_search(query, metadata_filter="modified_at >= `1702672093`")

# take into account only sources modified later than unix timestamp
docs = client.similarity_search(query, metadata_filter="owner == `james`")

# take into account only sources with path containing 'repo_readme'
docs = client.similarity_search(query, metadata_filter="contains(path, 'repo_readme')")

# and of two conditions
docs = client.similarity_search(
    query, metadata_filter="owner == `james` && modified_at >= `1702672093`"
)

# or of two conditions
docs = client.similarity_search(
    query, metadata_filter="owner == `james` || modified_at >= `1702672093`"
)
```

## インデックス化されたファイルの情報の取得

`PathwayVectorClient.get_vectorstore_statistics()`を使うと、インデックス化されたファイルの数や最終更新日時など、ベクトルストアの状態に関する重要な統計情報が得られます。チェーンでこれを使って、ナレッジベースの新鮮さをユーザーに伝えることができます。

```python
client.get_vectorstore_statistics()
```

## 独自のパイプラインについて

### 本番環境での実行

自分のパスウェイデータインデックスパイプラインを持つには、[ホスティングサービス](https://pathway.com/solutions/ai-pipelines)を利用するか、[パスウェイガイド](https://pathway.com/developers/user-guide/llm-xpack/vectorstore_pipeline/)を参考に自分で構築する必要があります。

### ドキュメントの処理

ベクトル化パイプラインには、ドキュメントの解析、分割、埋め込みのためのプラグイン可能なコンポーネントがあります。埋め込みや分割には[Langchainコンポーネント](https://pathway.com/developers/user-guide/llm-xpack/vectorstore_pipeline/#langchain)を使うか、パスウェイで利用可能な[埋め込み](https://pathway.com/developers/api-docs/pathway-xpacks-llm/embedders)や[分割](https://pathway.com/developers/api-docs/pathway-xpacks-llm/splitters)のコンポーネントを確認してください。パーサーが指定されていない場合は、デフォルトで`UTF-8`パーサーが使用されます。利用可能なパーサーは[こちら](https://github.com/pathwaycom/pathway/blob/main/python/pathway/xpacks/llm/parser.py)で確認できます。
