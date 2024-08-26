---
translated: true
---

# Ollama

Ollama Embeddings 클래스를 로드해 보겠습니다.

```python
from langchain_community.embeddings import OllamaEmbeddings
```

```python
embeddings = OllamaEmbeddings()
```

```python
text = "This is a test document."
```

임베딩을 생성하려면 개별 텍스트를 쿼리하거나 텍스트 목록을 쿼리할 수 있습니다.

```python
query_result = embeddings.embed_query(text)
query_result[:5]
```

```output
[-0.09996652603149414,
 0.015568195842206478,
 0.17670190334320068,
 0.16521021723747253,
 0.21193109452724457]
```

```python
doc_result = embeddings.embed_documents([text])
doc_result[0][:5]
```

```output
[-0.04242777079343796,
 0.016536075621843338,
 0.10052520781755447,
 0.18272875249385834,
 0.2079043835401535]
```

더 작은 모델(예: llama:7b)로 Ollama Embeddings 클래스를 로드해 보겠습니다. 참고: 지원되는 다른 모델은 [https://ollama.ai/library](https://ollama.ai/library)에서 확인할 수 있습니다.

```python
embeddings = OllamaEmbeddings(model="llama2:7b")
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
query_result[:5]
```

```output
[-0.09996627271175385,
 0.015567859634757042,
 0.17670205235481262,
 0.16521376371383667,
 0.21193283796310425]
```

```python
doc_result = embeddings.embed_documents([text])
```

```python
doc_result[0][:5]
```

```output
[-0.042427532374858856,
 0.01653730869293213,
 0.10052604228258133,
 0.18272635340690613,
 0.20790338516235352]
```
