---
translated: true
---

# Hugging Face의 문장 변환기

>[Hugging Face sentence-transformers](https://huggingface.co/sentence-transformers)는 최신 문장, 텍스트 및 이미지 임베딩을 위한 Python 프레임워크입니다.
>임베딩 모델 중 하나가 `HuggingFaceEmbeddings` 클래스에 사용됩니다.
>또한 `SentenceTransformerEmbeddings`에 대한 별칭을 추가했습니다. 이 패키지를 직접 사용하는 데 익숙한 사용자를 위한 것입니다.

`sentence_transformers` 패키지 모델은 [Sentence-BERT](https://arxiv.org/abs/1908.10084)에서 시작되었습니다.

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
