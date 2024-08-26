---
translated: true
---

# Hugging Face에서 Instruct Embeddings 사용하기

>[Hugging Face sentence-transformers](https://huggingface.co/sentence-transformers)는 최신 문장, 텍스트 및 이미지 임베딩을 위한 Python 프레임워크입니다.
>instruct embedding 모델 중 하나가 `HuggingFaceInstructEmbeddings` 클래스에서 사용됩니다.

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
