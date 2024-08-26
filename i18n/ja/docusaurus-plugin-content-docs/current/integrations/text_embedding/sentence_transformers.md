---
translated: true
---

# Hugging Face のセンテンス変換器

>[Hugging Face sentence-transformers](https://huggingface.co/sentence-transformers) は、最先端のセンテンス、テキスト、および画像の埋め込みのための Python フレームワークです。
>埋め込みモデルの1つが `HuggingFaceEmbeddings` クラスで使用されています。
>また、その package を直接使用することに慣れている人のために、`SentenceTransformerEmbeddings` のエイリアスも追加しました。

`sentence_transformers` パッケージのモデルは、[Sentence-BERT](https://arxiv.org/abs/1908.10084) に由来しています。

```python
%pip install --upgrade --quiet  sentence_transformers > /dev/null
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.0.1[0m[39;49m -> [0m[32;49m23.1.1[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
```

```python
from langchain_community.embeddings import HuggingFaceEmbeddings
```

```python
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
# Equivalent to SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text, "This is not a test document."])
```
