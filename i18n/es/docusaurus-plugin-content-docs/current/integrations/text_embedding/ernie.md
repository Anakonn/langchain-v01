---
translated: true
---

# ERNIE

[ERNIE Embedding-V1](https://cloud.baidu.com/doc/WENXINWORKSHOP/s/alj562vvu) es un modelo de representación de texto basado en la tecnología de modelos a gran escala de `Baidu Wenxin`, que convierte el texto en una forma vectorial representada por valores numéricos y se utiliza en la recuperación de texto, la recomendación de información, la minería de conocimientos y otros escenarios.

**Advertencia de Obsolescencia**

Recomendamos a los usuarios que utilicen `langchain_community.embeddings.ErnieEmbeddings` que utilicen `langchain_community.embeddings.QianfanEmbeddingsEndpoint` en su lugar.

La documentación de `QianfanEmbeddingsEndpoint` se encuentra [aquí](/docs/integrations/text_embedding/baidu_qianfan_endpoint/).

Hay 2 razones por las que recomendamos a los usuarios que utilicen `QianfanEmbeddingsEndpoint`:

1. `QianfanEmbeddingsEndpoint` admite más modelos de incrustación en la plataforma Qianfan.
2. `ErnieEmbeddings` carece de mantenimiento y está en desuso.

Algunos consejos para la migración:

```python
from langchain_community.embeddings import QianfanEmbeddingsEndpoint

embeddings = QianfanEmbeddingsEndpoint(
    qianfan_ak="your qianfan ak",
    qianfan_sk="your qianfan sk",
)
```

## Uso

```python
from langchain_community.embeddings import ErnieEmbeddings
```

```python
embeddings = ErnieEmbeddings()
```

```python
query_result = embeddings.embed_query("foo")
```

```python
doc_results = embeddings.embed_documents(["foo"])
```
