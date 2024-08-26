---
translated: true
---

# HuggingFace上のBGE

>[HuggingFace上のBGEモデル](https://huggingface.co/BAAI/bge-large-en)は[最高のオープンソースの埋め込みモデル](https://huggingface.co/spaces/mteb/leaderboard)です。
>BGEモデルは[北京人工知能研究院(BAAI)](https://en.wikipedia.org/wiki/Beijing_Academy_of_Artificial_Intelligence)によって作成されました。`BAAI`は人工知能の研究開発に従事する非営利の民間組織です。

このノートブックでは、`Hugging Face`を通じて`BGEエンベディング`を使用する方法を示します。

```python
%pip install --upgrade --quiet  sentence_transformers
```

```python
from langchain_community.embeddings import HuggingFaceBgeEmbeddings

model_name = "BAAI/bge-small-en"
model_kwargs = {"device": "cpu"}
encode_kwargs = {"normalize_embeddings": True}
hf = HuggingFaceBgeEmbeddings(
    model_name=model_name, model_kwargs=model_kwargs, encode_kwargs=encode_kwargs
)
```

```python
embedding = hf.embed_query("hi this is harrison")
len(embedding)
```

```output
384
```
