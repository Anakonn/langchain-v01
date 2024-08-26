---
translated: true
---

# Rockset

>[Rockset](https://rockset.com/)は、クラウド向けに構築されたリアルタイム検索およびアナリティクスデータベースです。Rocksetは、ベクトルエンベディングの効率的なストアを備えた[Converged Index™](https://rockset.com/blog/converged-indexing-the-secret-sauce-behind-rocksets-fast-queries/)を使用して、大規模な低レイテンシーと高コンカレンシーの検索クエリをサーブします。Rocksetは、メタデータフィルタリングを完全にサポートし、絶えず更新されるストリーミングデータの実時間取り込みを処理します。

このノートブックでは、LangChainでRocksetをベクトルストアとして使用する方法を示します。始める前に、RocksetアカウントとAPIキーにアクセスできることを確認してください。[今すぐ無料トライアルを始めましょう。](https://rockset.com/create/)

## 環境のセットアップ

1. Rocksetコンソールを使用して、Write APIをソースとする[コレクション](https://rockset.com/docs/collections/)を作成します。このチュートリアルでは、`langchain_demo`という名前のコレクションを作成します。

    次の[取り込み変換](https://rockset.com/docs/ingest-transformation/)を構成して、エンベディングフィールドをマークし、パフォーマンスとストレージの最適化を活用します:

   (この例では、OpenAI `text-embedding-ada-002`を使用しています。ベクトルエンベディングの長さは1536です)

```sql
SELECT _input.* EXCEPT(_meta),
VECTOR_ENFORCE(_input.description_embedding, #length_of_vector_embedding, 'float') as description_embedding
FROM _input
```

2. コレクションを作成したら、コンソールを使用して[APIキー](https://rockset.com/docs/iam/#users-api-keys-and-roles)を取得します。このノートブックの目的上、`Oregon(us-west-2)`リージョンを使用しているものとします。

3. [rockset-python-client](https://github.com/rockset/rockset-python-client)をインストールして、LangChainがRocksetと直接通信できるようにします。

```python
%pip install --upgrade --quiet  rockset
```

## LangChainチュートリアル

自分のPythonノートブックで、ベクトルエンベディングをRocksetに生成および保存し、検索クエリに似た文書を検索します。

### 1. 主要な変数を定義する

```python
import os

import rockset

ROCKSET_API_KEY = os.environ.get(
    "ROCKSET_API_KEY"
)  # Verify ROCKSET_API_KEY environment variable
ROCKSET_API_SERVER = rockset.Regions.usw2a1  # Verify Rockset region
rockset_client = rockset.RocksetClient(ROCKSET_API_SERVER, ROCKSET_API_KEY)

COLLECTION_NAME = "langchain_demo"
TEXT_KEY = "description"
EMBEDDING_KEY = "description_embedding"
```

### 2. 文書を準備する

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Rockset
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### 3. 文書を挿入する

```python
embeddings = OpenAIEmbeddings()  # Verify OPENAI_API_KEY environment variable

docsearch = Rockset(
    client=rockset_client,
    embeddings=embeddings,
    collection_name=COLLECTION_NAME,
    text_key=TEXT_KEY,
    embedding_key=EMBEDDING_KEY,
)

ids = docsearch.add_texts(
    texts=[d.page_content for d in docs],
    metadatas=[d.metadata for d in docs],
)
```

### 4. 類似文書を検索する

```python
query = "What did the president say about Ketanji Brown Jackson"
output = docsearch.similarity_search_with_relevance_scores(
    query, 4, Rockset.DistanceFunction.COSINE_SIM
)
print("output length:", len(output))
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")

##
# output length: 4
# 0.764990692109871 {'source': '../../../state_of_the_union.txt'} Madam Speaker, Madam...
# 0.7485416901622112 {'source': '../../../state_of_the_union.txt'} And I’m taking robus...
# 0.7468678973398306 {'source': '../../../state_of_the_union.txt'} And so many families...
# 0.7436231261419488 {'source': '../../../state_of_the_union.txt'} Groups of citizens b...
```

### 5. メタデータフィルタリングを使用して類似文書を検索する

```python
output = docsearch.similarity_search_with_relevance_scores(
    query,
    4,
    Rockset.DistanceFunction.COSINE_SIM,
    where_str="{} NOT LIKE '%citizens%'".format(TEXT_KEY),
)
print("output length:", len(output))
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")

##
# output length: 4
# 0.7651359650263554 {'source': '../../../state_of_the_union.txt'} Madam Speaker, Madam...
# 0.7486265516824893 {'source': '../../../state_of_the_union.txt'} And I’m taking robus...
# 0.7469625542348115 {'source': '../../../state_of_the_union.txt'} And so many families...
# 0.7344177777547739 {'source': '../../../state_of_the_union.txt'} We see the unity amo...
```

### 6. [オプション] 挿入した文書を削除する

各文書の一意のIDを持っている必要があります。
`Rockset.add_texts()`で文書を挿入する際に、IDを定義します。そうしないと、Rocksetが各文書に一意のIDを生成します。ただし、`Rockset.add_texts()`は挿入された文書のIDを返します。

これらの文書を削除するには、単に`Rockset.delete_texts()`関数を使用します。

```python
docsearch.delete_texts(ids)
```

## まとめ

このチュートリアルでは、Rocksetコレクションを正常に作成し、OpenAIエンベディングを使って文書を挿入し、メタデータフィルタを使用/使用せずに類似文書を検索することができました。

https://rockset.com/の今後の更新に注目してください。
