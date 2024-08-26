---
translated: true
---

# Google Generative AI Embeddings

Google の generative AI embeddings サービスに接続するには、[langchain-google-genai](https://pypi.org/project/langchain-google-genai/) パッケージにある `GoogleGenerativeAIEmbeddings` クラスを使用します。

## インストール

```python
%pip install --upgrade --quiet  langchain-google-genai
```

## 資格情報

```python
import getpass
import os

if "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = getpass("Provide your Google API key here")
```

## 使用方法

```python
from langchain_google_genai import GoogleGenerativeAIEmbeddings

embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
vector = embeddings.embed_query("hello, world!")
vector[:5]
```

```output
[0.05636945, 0.0048285457, -0.0762591, -0.023642512, 0.05329321]
```

## バッチ

一度に複数の文字列をエンベディングすることで、処理速度を上げることができます:

```python
vectors = embeddings.embed_documents(
    [
        "Today is Monday",
        "Today is Tuesday",
        "Today is April Fools day",
    ]
)
len(vectors), len(vectors[0])
```

```output
(3, 768)
```

## タスクタイプ

`GoogleGenerativeAIEmbeddings` では、オプションで `task_type` を指定できます。現在サポートされているのは以下のタイプです:

- task_type_unspecified
- retrieval_query
- retrieval_document
- semantic_similarity
- classification
- clustering

デフォルトでは、`embed_documents` メソッドでは `retrieval_document`、`embed_query` メソッドでは `retrieval_query` が使用されます。タスクタイプを指定した場合は、すべてのメソッドでそのタイプが使用されます。

```python
%pip install --upgrade --quiet  matplotlib scikit-learn
```

```output
Note: you may need to restart the kernel to use updated packages.
```

```python
query_embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001", task_type="retrieval_query"
)
doc_embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001", task_type="retrieval_document"
)
```

これらすべてが 'retrieval_query' タスクでエンベディングされます

```python
query_vecs = [query_embeddings.embed_query(q) for q in [query, query_2, answer_1]]
```

これらすべてが 'retrieval_document' タスクでエンベディングされます

```python
doc_vecs = [doc_embeddings.embed_query(q) for q in [query, query_2, answer_1]]
```

リトリーバルでは、相対的な距離が重要です。上の画像では、"relevant doc" と "simil" の類似度スコアの差が、後者の場合のほうが大きいことがわかります。

## 追加の設定

`ChatGoogleGenerativeAI` に以下のパラメータを渡すことで、SDK の動作をカスタマイズできます:

- `client_options`: Google API クライアントに渡す [Client Options](https://googleapis.dev/python/google-api-core/latest/client_options.html#module-google.api_core.client_options)、例えば `client_options["api_endpoint"]` のようなカスタムオプション
- `transport`: 使用するトランスポート方式、`rest`、`grpc`、`grpc_asyncio` から選択
