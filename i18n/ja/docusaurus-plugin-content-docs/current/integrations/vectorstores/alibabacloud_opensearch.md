---
translated: true
---

# Alibaba Cloud OpenSearch

>[Alibaba Cloud Opensearch](https://www.alibabacloud.com/product/opensearch)は、インテリジェントな検索サービスを開発するためのワンストッププラットフォームです。 `OpenSearch`は、Alibabaが開発した大規模分散型検索エンジンに基づいて構築されています。 `OpenSearch`は、Alibaba Groupの500以上のビジネスケースと、数千のAlibabaクラウドのお客様に提供されています。 `OpenSearch`は、eコマース、O2O、マルチメディア、コンテンツ業界、コミュニティとフォーラム、企業の大規模データクエリなど、さまざまな検索シナリオでの検索サービスの開発をサポートします。

>`OpenSearch`は、ユーザーに高い検索効率と精度を提供するために、メンテナンスフリーで高パフォーマンスなインテリジェント検索サービスの開発をサポします。

>`OpenSearch`はベクトル検索機能を提供しています。特に、テスト問題検索や画像検索のシナリオでは、ベクトル検索機能とマルチモーダル検索機能を組み合わせて、検索結果の精度を向上させることができます。

このノートブックでは、`Alibaba Cloud OpenSearch Vector Search Edition`に関連する機能の使用方法を示します。

## 設定

### インスタンスの購入と設定

[Alibaba Cloud](https://opensearch.console.aliyun.com)からOpenSearch Vector Search Editionを購入し、[ドキュメント](https://help.aliyun.com/document_detail/463198.html?spm=a2c4g.465092.0.0.2cd15002hdwavO)に従ってインスタンスを設定してください。

実行するには、[OpenSearch Vector Search Edition](https://opensearch.console.aliyun.com)のインスタンスが稼働している必要があります。

### Alibaba Cloud OpenSearch Vector Storeクラス

                                                                                                                `AlibabaCloudOpenSearch`クラスは以下の機能をサポートしています:
- `add_texts`
- `add_documents`
- `from_texts`
- `from_documents`
- `similarity_search`
- `asimilarity_search`
- `similarity_search_by_vector`
- `asimilarity_search_by_vector`
- `similarity_search_with_relevance_scores`
- `delete_doc_by_texts`

OpenSearch Vector Search Editionインスタンスの設定と使用方法については、[ヘルプドキュメント](https://www.alibabacloud.com/help/en/opensearch/latest/vector-search)を参照してください。

使用中に問題が発生した場合は、xingshaomin.xsm@alibaba-inc.comまでお気軽にお問い合わせください。できる限りサポートさせていただきます。

インスタンスが稼働したら、ドキュメントの分割、エンベディングの取得、Alibaba Cloud OpenSearchインスタンスへの接続、ドキュメントのインデックス化、ベクトル検索の実行などの手順に従ってください。

最初に、以下のPythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  alibabacloud_ha3engine_vector
```

`OpenAIEmbeddings`を使用するには、OpenAI APIキーを取得する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## 例

```python
from langchain_community.vectorstores import (
    AlibabaCloudOpenSearch,
    AlibabaCloudOpenSearchSettings,
)
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

ドキュメントを分割し、エンベディングを取得します。

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

OpenSearch設定を作成します。

```python
settings = AlibabaCloudOpenSearchSettings(
    endpoint=" The endpoint of opensearch instance, You can find it from the console of Alibaba Cloud OpenSearch.",
    instance_id="The identify of opensearch instance, You can find it from the console of Alibaba Cloud OpenSearch.",
    protocol="Communication Protocol between SDK and Server, default is http.",
    username="The username specified when purchasing the instance.",
    password="The password specified when purchasing the instance.",
    namespace="The instance data will be partitioned based on the namespace field. If the namespace is enabled, you need to specify the namespace field name during initialization. Otherwise, the queries cannot be executed correctly.",
    tablename="The table name specified during instance configuration.",
    embedding_field_separator="Delimiter specified for writing vector field data, default is comma.",
    output_fields="Specify the field list returned when invoking OpenSearch, by default it is the value list of the field mapping field.",
    field_name_mapping={
        "id": "id",  # The id field name mapping of index document.
        "document": "document",  # The text field name mapping of index document.
        "embedding": "embedding",  # The embedding field name mapping of index document.
        "name_of_the_metadata_specified_during_search": "opensearch_metadata_field_name,=",
        # The metadata field name mapping of index document, could specify multiple, The value field contains mapping name and operator, the operator would be used when executing metadata filter query,
        # Currently supported logical operators are: > (greater than), < (less than), = (equal to), <= (less than or equal to), >= (greater than or equal to), != (not equal to).
        # Refer to this link: https://help.aliyun.com/zh/open-search/vector-search-edition/filter-expression
    },
)

# for example

# settings = AlibabaCloudOpenSearchSettings(
#     endpoint='ha-cn-5yd3fhdm102.public.ha.aliyuncs.com',
#     instance_id='ha-cn-5yd3fhdm102',
#     username='instance user name',
#     password='instance password',
#     table_name='test_table',
#     field_name_mapping={
#         "id": "id",
#         "document": "document",
#         "embedding": "embedding",
#         "string_field": "string_filed,=",
#         "int_field": "int_filed,=",
#         "float_field": "float_field,=",
#         "double_field": "double_field,="
#
#     },
# )
```

設定を使用してOpenSearchアクセスインスタンスを作成します。

```python
# Create an opensearch instance and index docs.
opensearch = AlibabaCloudOpenSearch.from_texts(
    texts=docs, embedding=embeddings, config=settings
)
```

または

```python
# Create an opensearch instance.
opensearch = AlibabaCloudOpenSearch(embedding=embeddings, config=settings)
```

テキストを追加してインデックスを構築します。

```python
metadatas = [
    {"string_field": "value1", "int_field": 1, "float_field": 1.0, "double_field": 2.0},
    {"string_field": "value2", "int_field": 2, "float_field": 3.0, "double_field": 4.0},
    {"string_field": "value3", "int_field": 3, "float_field": 5.0, "double_field": 6.0},
]
# the key of metadatas must match field_name_mapping in settings.
opensearch.add_texts(texts=docs, ids=[], metadatas=metadatas)
```

クエリを実行し、データを取得します。

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = opensearch.similarity_search(query)
print(docs[0].page_content)
```

メタデータを含むクエリを実行し、データを取得します。

```python
query = "What did the president say about Ketanji Brown Jackson"
metadata = {
    "string_field": "value1",
    "int_field": 1,
    "float_field": 1.0,
    "double_field": 2.0,
}
docs = opensearch.similarity_search(query, filter=metadata)
print(docs[0].page_content)
```

使用中に問題が発生した場合は、<xingshaomin.xsm@alibaba-inc.com>までお気軽にお問い合わせください。できる限りサポートさせていただきます。
