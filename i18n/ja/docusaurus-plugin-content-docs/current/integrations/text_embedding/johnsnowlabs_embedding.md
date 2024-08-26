---
translated: true
---

# John Snow Labs

>[John Snow Labs](https://nlp.johnsnowlabs.com/) NLP & LLM エコシステムには、大規模な最先端AI用のソフトウェアライブラリ、責任あるAI、ノーコードAI、そして医療、法律、金融など20,000以上のモデルへのアクセスが含まれています。

>モデルは[nlp.load](https://nlp.johnsnowlabs.com/docs/en/jsl/load_api)でロードされ、[nlp.start()](https://nlp.johnsnowlabs.com/docs/en/jsl/start-a-sparksession)でSparkセッションが起動します。
>24,000以上のすべてのモデルについては、[John Snow Labs Model Models Hub](https://nlp.johnsnowlabs.com/models)をご覧ください。

## 設定

```python
%pip install --upgrade --quiet  johnsnowlabs
```

```python
# If you have a enterprise license, you can run this to install enterprise features
# from johnsnowlabs import nlp
# nlp.install()
```

## 例

```python
from langchain_community.embeddings.johnsnowlabs import JohnSnowLabsEmbeddings
```

JohnSnowLabsEmbeddingsを初期化してSparkセッションを開始します。

```python
embedder = JohnSnowLabsEmbeddings("en.embed_sentence.biobert.clinical_base_cased")
```

分析したいドキュメントの例文を定義します。これは、ニュース記事、ソーシャルメディアの投稿、製品レビューなどの任意のドキュメントです。

```python
texts = ["Cancer is caused by smoking", "Antibiotics aren't painkiller"]
```

テキストのエンベディングを生成して出力します。JohnSnowLabsEmbeddingsクラスは、各ドキュメントのエンベディング(ドキュメントの内容を表す数値表現)を生成します。これらのエンベディングは、ドキュメントの類似性比較やテキスト分類などの自然言語処理タスクに使用できます。

```python
embeddings = embedder.embed_documents(texts)
for i, embedding in enumerate(embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```

単一のテキストのエンベディングを生成して出力します。検索クエリなどの単一のテキストについても、エンベディングを生成できます。これは、情報検索のようなタスクで、与えられたクエリに似たドキュメントを見つけるのに役立ちます。

```python
query = "Cancer is caused by smoking"
query_embedding = embedder.embed_query(query)
print(f"Embedding for query: {query_embedding}")
```
