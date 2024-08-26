---
translated: true
---

# Embaas

[embaas](https://embaas.io) は、埋め込み生成、ドキュメントテキスト抽出、ドキュメントから埋め込みなどの機能を提供する完全に管理されたNLP APIサービスです。[さまざまな事前トレーニングされたモデル](https://embaas.io/docs/models/embeddings)を選択できます。

このチュートリアルでは、embaas Embeddings APIを使用して、与えられたテキストの埋め込みを生成する方法を示します。

### 前提条件

[https://embaas.io/register](https://embaas.io/register)でembaas無料アカウントを作成し、[APIキー](https://embaas.io/dashboard/api-keys)を生成してください。

```python
import os

# Set API key
embaas_api_key = "YOUR_API_KEY"
# or set environment variable
os.environ["EMBAAS_API_KEY"] = "YOUR_API_KEY"
```

```python
from langchain_community.embeddings import EmbaasEmbeddings
```

```python
embeddings = EmbaasEmbeddings()
```

```python
# Create embeddings for a single document
doc_text = "This is a test document."
doc_text_embedding = embeddings.embed_query(doc_text)
```

```python
# Print created embedding
print(doc_text_embedding)
```

```python
# Create embeddings for multiple documents
doc_texts = ["This is a test document.", "This is another test document."]
doc_texts_embeddings = embeddings.embed_documents(doc_texts)
```

```python
# Print created embeddings
for i, doc_text_embedding in enumerate(doc_texts_embeddings):
    print(f"Embedding for document {i + 1}: {doc_text_embedding}")
```

```python
# Using a different model and/or custom instruction
embeddings = EmbaasEmbeddings(
    model="instructor-large",
    instruction="Represent the Wikipedia document for retrieval",
)
```

embaas Embeddings APIの詳細については、[公式embaas APIドキュメント](https://embaas.io/api-reference)を参照してください。
