---
translated: true
---

# LocalAI

LocalAI Embedding クラスをロードしましょう。LocalAI Embedding クラスを使用するには、LocalAI サービスをどこかでホストし、埋め込みモデルを構成する必要があります。https://localai.io/basics/getting_started/index.html と https://localai.io/features/embeddings/index.html のドキュメントを参照してください。

```python
from langchain_community.embeddings import LocalAIEmbeddings
```

```python
embeddings = LocalAIEmbeddings(
    openai_api_base="http://localhost:8080", model="embedding-model-name"
)
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```

最初の世代のモデル (text-search-ada-doc-001/text-search-ada-query-001 など) を使用して、LocalAI Embedding クラスをロードしましょう。注意: これらのモデルは推奨されていません - [ここ](https://platform.openai.com/docs/guides/embeddings/what-are-embeddings)を参照してください。

```python
from langchain_community.embeddings import LocalAIEmbeddings
```

```python
embeddings = LocalAIEmbeddings(
    openai_api_base="http://localhost:8080", model="embedding-model-name"
)
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```

```python
import os

# if you are behind an explicit proxy, you can use the OPENAI_PROXY environment variable to pass through
os.environ["OPENAI_PROXY"] = "http://proxy.yourcompany.com:8080"
```
