---
translated: true
---

# Pinecone ハイブリッド検索

>[Pinecone](https://docs.pinecone.io/docs/overview)はさまざまな機能を持つベクトルデータベースです。

このノートブックでは、Pineconeとハイブリッド検索を使用するリトリーバーの使用方法について説明します。

このリトリーバーのロジックは[このドキュメント](https://docs.pinecone.io/docs/hybrid-search)から取られています。

Pineconeを使用するには、APIキーと環境が必要です。
[インストール手順](https://docs.pinecone.io/docs/quickstart)はこちらです。

```python
%pip install --upgrade --quiet  pinecone-client pinecone-text
```

```python
import getpass
import os

os.environ["PINECONE_API_KEY"] = getpass.getpass("Pinecone API Key:")
```

```python
from langchain_community.retrievers import (
    PineconeHybridSearchRetriever,
)
```

```python
os.environ["PINECONE_ENVIRONMENT"] = getpass.getpass("Pinecone Environment:")
```

`OpenAIEmbeddings`を使用するには、OpenAI APIキーが必要です。

```python
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## Pineconeのセットアップ

この部分は一度だけ行えば良いです。

注意: ドキュメントテキストを保持するメタデータの"context"フィールドはインデックス化しないことが重要です。現在のところ、インデックス化したいフィールドを明示的に指定する必要があります。詳細はPineconeの[ドキュメント](https://docs.pinecone.io/docs/manage-indexes#selective-metadata-indexing)をご確認ください。

```python
import os

import pinecone

api_key = os.getenv("PINECONE_API_KEY") or "PINECONE_API_KEY"

index_name = "langchain-pinecone-hybrid-search"
```

```output
WhoAmIResponse(username='load', user_label='label', projectname='load-test')
```

```python
# create the index
pinecone.create_index(
    name=index_name,
    dimension=1536,  # dimensionality of dense model
    metric="dotproduct",  # sparse values supported only for dotproduct
    pod_type="s1",
    metadata_config={"indexed": []},  # see explanation above
)
```

これで作成できたので、使用することができます。

```python
index = pinecone.Index(index_name)
```

## 埋め込みとスパース エンコーダーの取得

埋め込みは密ベクトルに、トークナイザーはスパースベクトルに使用されます。

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

テキストをスパース値にエンコードするには、SPLADEかBM25を選択できます。ドメイン外のタスクではBM25の使用をお勧めします。

スパースエンコーダーの詳細については、pinecone-textライブラリの[ドキュメント](https://pinecone-io.github.io/pinecone-text/pinecone_text.html)をご確認ください。

```python
from pinecone_text.sparse import BM25Encoder

# or from pinecone_text.sparse import SpladeEncoder if you wish to work with SPLADE

# use default tf-idf values
bm25_encoder = BM25Encoder().default()
```

上記のコードはデフォルトのtf-idf値を使用しています。自身のコーパスに合わせてtf-idf値をフィットさせることを強くお勧めします。以下のように行うことができます:

```python
corpus = ["foo", "bar", "world", "hello"]

# fit tf-idf values on your corpus
bm25_encoder.fit(corpus)

# store the values to a json file
bm25_encoder.dump("bm25_values.json")

# load to your BM25Encoder object
bm25_encoder = BM25Encoder().load("bm25_values.json")
```

## リトリーバーの読み込み

リトリーバーを構築することができます!

```python
retriever = PineconeHybridSearchRetriever(
    embeddings=embeddings, sparse_encoder=bm25_encoder, index=index
)
```

## テキストの追加(必要に応じて)

必要に応じて、リトリーバーにテキストを追加することができます。

```python
retriever.add_texts(["foo", "bar", "world", "hello"])
```

```output
100%|██████████| 1/1 [00:02<00:00,  2.27s/it]
```

## リトリーバーの使用

リトリーバーを使用することができます!

```python
result = retriever.invoke("foo")
```

```python
result[0]
```

```output
Document(page_content='foo', metadata={})
```
