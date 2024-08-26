---
translated: true
---

# Inferencia de Incrustaciones de Texto

>[Hugging Face Text Embeddings Inference (TEI)](https://huggingface.co/docs/text-embeddings-inference/index) es un conjunto de herramientas para implementar y servir modelos de incrustaciones de texto y clasificación de secuencias de código abierto. `TEI` permite la extracción de alto rendimiento para los modelos más populares, incluyendo `FlagEmbedding`, `Ember`, `GTE` y `E5`.

Para usarlo dentro de langchain, primero instala `huggingface-hub`.

```python
%pip install --upgrade huggingface-hub
```

Luego expone un modelo de incrustación usando TEI. Por ejemplo, usando Docker, puedes servir `BAAI/bge-large-en-v1.5` de la siguiente manera:

```bash
model=BAAI/bge-large-en-v1.5
revision=refs/pr/5
volume=$PWD/data # share a volume with the Docker container to avoid downloading weights every run

docker run --gpus all -p 8080:80 -v $volume:/data --pull always ghcr.io/huggingface/text-embeddings-inference:0.6 --model-id $model --revision $revision
```

Finalmente, instancia el cliente e incrusta tus textos.

```python
from langchain_community.embeddings import HuggingFaceHubEmbeddings
```

```python
embeddings = HuggingFaceHubEmbeddings(model="http://localhost:8080")
```

```python
text = "What is deep learning?"
```

```python
query_result = embeddings.embed_query(text)
query_result[:3]
```

```output
[0.018113142, 0.00302585, -0.049911194]
```

```python
doc_result = embeddings.embed_documents([text])
```

```python
doc_result[0][:3]
```

```output
[0.018113142, 0.00302585, -0.049911194]
```
