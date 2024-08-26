---
translated: true
---

# Hugging Face의 BGE

>[Hugging Face의 BGE 모델](https://huggingface.co/BAAI/bge-large-en)은 [최고의 오픈 소스 임베딩 모델](https://huggingface.co/spaces/mteb/leaderboard)입니다.
>BGE 모델은 [베이징 인공지능 아카데미(BAAI)](https://en.wikipedia.org/wiki/Beijing_Academy_of_Artificial_Intelligence)에서 만들었습니다. `BAAI`는 인공지능 연구 및 개발에 종사하는 비영리 기관입니다.

이 노트북은 `Hugging Face`를 통해 `BGE 임베딩`을 사용하는 방법을 보여줍니다.

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
