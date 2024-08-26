---
translated: true
---

# OpenVINO

[OpenVINO™](https://github.com/openvinotoolkit/openvino) est une boîte à outils open-source pour optimiser et déployer l'inférence IA. Le runtime OpenVINO™ prend en charge divers [appareils](https://github.com/openvinotoolkit/openvino?tab=readme-ov-file#supported-hardware-matrix) matériels, notamment les processeurs x86 et ARM, ainsi que les GPU Intel. Il peut aider à booster les performances de l'apprentissage profond dans la vision par ordinateur, la reconnaissance vocale automatique, le traitement du langage naturel et d'autres tâches courantes.

Le modèle d'intégration Hugging Face peut être pris en charge par OpenVINO via la classe ``OpenVINOEmbeddings``. Si vous avez un GPU Intel, vous pouvez spécifier `model_kwargs={"device": "GPU"}` pour exécuter l'inférence dessus.

```python
%pip install --upgrade-strategy eager "optimum[openvino,nncf]" --quiet
```

```output
Note: you may need to restart the kernel to use updated packages.
```

```python
from langchain_community.embeddings import OpenVINOEmbeddings
```

```python
model_name = "sentence-transformers/all-mpnet-base-v2"
model_kwargs = {"device": "CPU"}
encode_kwargs = {"mean_pooling": True, "normalize_embeddings": True}

ov_embeddings = OpenVINOEmbeddings(
    model_name_or_path=model_name,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs,
)
```

```python
text = "This is a test document."
```

```python
query_result = ov_embeddings.embed_query(text)
```

```python
query_result[:3]
```

```output
[-0.048951778560876846, -0.03986183926463127, -0.02156277745962143]
```

```python
doc_result = ov_embeddings.embed_documents([text])
```

## Exporter le modèle IR

Il est possible d'exporter votre modèle d'intégration au format OpenVINO IR avec ``OVModelForFeatureExtraction`` et de charger le modèle à partir d'un dossier local.

```python
from pathlib import Path

ov_model_dir = "all-mpnet-base-v2-ov"
if not Path(ov_model_dir).exists():
    ov_embeddings.save_model(ov_model_dir)
```

```python
ov_embeddings = OpenVINOEmbeddings(
    model_name_or_path=ov_model_dir,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs,
)
```

```output
Compiling the model to CPU ...
```

## BGE avec OpenVINO

Nous pouvons également accéder aux modèles d'intégration BGE via la classe ``OpenVINOBgeEmbeddings`` avec OpenVINO.

```python
from langchain_community.embeddings import OpenVINOBgeEmbeddings

model_name = "BAAI/bge-small-en"
model_kwargs = {"device": "CPU"}
encode_kwargs = {"normalize_embeddings": True}
ov_embeddings = OpenVINOBgeEmbeddings(
    model_name_or_path=model_name,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs,
)
```

```python
embedding = ov_embeddings.embed_query("hi this is harrison")
len(embedding)
```

```output
384
```

Pour plus d'informations, consultez :

* [Guide OpenVINO LLM](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html).

* [Documentation OpenVINO](https://docs.openvino.ai/2024/home.html).

* [Guide de démarrage rapide OpenVINO](https://www.intel.com/content/www/us/en/content-details/819067/openvino-get-started-guide.html).

* [Notebook RAG avec LangChain](https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/llm-rag-langchain).
