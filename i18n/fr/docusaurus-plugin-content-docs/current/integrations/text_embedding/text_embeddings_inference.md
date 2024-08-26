---
translated: true
---

# Inférence des Embeddings de Texte

>[Inférence des Embeddings de Texte (IET) Hugging Face](https://huggingface.co/docs/text-embeddings-inference/index) est une boîte à outils pour déployer et servir des modèles d'embeddings de texte et de classification de séquences open-source. `IET` permet une extraction haute performance pour les modèles les plus populaires, y compris `FlagEmbedding`, `Ember`, `GTE` et `E5`.

Pour l'utiliser dans langchain, installez d'abord `huggingface-hub`.

```python
%pip install --upgrade huggingface-hub
```

Ensuite, exposez un modèle d'embedding à l'aide d'IET. Par exemple, en utilisant Docker, vous pouvez servir `BAAI/bge-large-en-v1.5` comme suit :

```bash
model=BAAI/bge-large-en-v1.5
revision=refs/pr/5
volume=$PWD/data # share a volume with the Docker container to avoid downloading weights every run

docker run --gpus all -p 8080:80 -v $volume:/data --pull always ghcr.io/huggingface/text-embeddings-inference:0.6 --model-id $model --revision $revision
```

Enfin, instanciez le client et embedez vos textes.

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
