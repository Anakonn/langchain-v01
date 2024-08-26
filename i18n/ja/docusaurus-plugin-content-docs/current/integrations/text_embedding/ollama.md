---
translated: true
---

# Ollama

Ollama Embeddingsクラスをロードしましょう。

```python
from langchain_community.embeddings import OllamaEmbeddings
```

```python
embeddings = OllamaEmbeddings()
```

```python
text = "This is a test document."
```

エンベディングを生成するには、個別のテキストを照会するか、テキストのリストを照会することができます。

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

より小さなモデル(例: llama:7b)でOllama Embeddingsクラスをロードしましょう。注意: 他のサポートされているモデルは[https://ollama.ai/library](https://ollama.ai/library)を参照してください。

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
