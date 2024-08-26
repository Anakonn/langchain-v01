---
translated: true
---

# Hugging Faceのインストラクト埋め込み

>[Hugging Face sentence-transformers](https://huggingface.co/sentence-transformers)は、最先端の文章、テキスト、画像の埋め込みのためのPythonフレームワークです。
>インストラクト埋め込みモデルの1つが`HuggingFaceInstructEmbeddings`クラスで使用されています。

```python
from langchain_community.embeddings import HuggingFaceInstructEmbeddings
```

```python
embeddings = HuggingFaceInstructEmbeddings(
    query_instruction="Represent the query for retrieval: "
)
```

```output
load INSTRUCTOR_Transformer
max_seq_length  512
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```
