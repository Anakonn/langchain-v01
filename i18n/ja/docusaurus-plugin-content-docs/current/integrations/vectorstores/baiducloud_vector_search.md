---
translated: true
---

# Baidu Cloud ElasticSearch VectorSearch

>[Baidu Cloud VectorSearch](https://cloud.baidu.com/doc/BES/index.html?from=productToDoc)は、オープンソースと100%互換性のある、完全に管理された企業レベルの分散型検索およびデータ分析サービスです。Baidu Cloud VectorSearchは、構造化/非構造化データに対して、低コスト、高パフォーマンス、信頼性の高い検索およびデータ分析プラットフォームレベルのサービスを提供します。ベクトルデータベースとして、複数のインデックスタイプおよび類似度計算方式をサポートしています。

>`Baidu Cloud ElasticSearch`は、クラスターの権限を自由に設定できる特権管理メカニズムを提供し、データセキュリティをさらに確保することができます。

このノートブックでは、`Baidu Cloud ElasticSearch VectorStore`に関連する機能の使用方法を示します。
実行するには、[Baidu Cloud ElasticSearch](https://cloud.baidu.com/product/bes.html)インスタンスを起動し、実行中にする必要があります。

[ヘルプドキュメント](https://cloud.baidu.com/doc/BES/s/8llyn0hh4)を読んで、Baidu Cloud ElasticSearchインスタンスを迅速に理解し、設定してください。

インスタンスが起動し、実行中になったら、以下の手順に従って、ドキュメントの分割、エンベディングの取得、Baidu Cloud ElasticSearchインスタンスへの接続、ドキュメントのインデックス化、ベクトル検索を行います。

最初に、以下のPythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  elasticsearch == 7.11.0
```

まず、`QianfanEmbeddings`を使用するため、Qianfan AKとSKを取得する必要があります。QianFanの詳細は[Baidu Qianfan Workshop](https://cloud.baidu.com/product/wenxinworkshop)を参照してください。

```python
import getpass
import os

os.environ["QIANFAN_AK"] = getpass.getpass("Your Qianfan AK:")
os.environ["QIANFAN_SK"] = getpass.getpass("Your Qianfan SK:")
```

次に、ドキュメントを分割し、エンベディングを取得します。

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

from langchain_community.embeddings import QianfanEmbeddingsEndpoint

embeddings = QianfanEmbeddingsEndpoint()
```

次に、Baidu ElasticeSearchにアクセスできるインスタンスを作成します。

```python
# Create a bes instance and index docs.
from langchain_community.vectorstores import BESVectorStore

bes = BESVectorStore.from_documents(
    documents=docs,
    embedding=embeddings,
    bes_url="your bes cluster url",
    index_name="your vector index",
)
bes.client.indices.refresh(index="your vector index")
```

最後に、クエリーを実行し、データを取得します。

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = bes.similarity_search(query)
print(docs[0].page_content)
```

ご使用中に問題が発生した場合は、<liuboyao@baidu.com>または<chenweixu01@baidu.com>までご連絡ください。できる限りサポートさせていただきます。
