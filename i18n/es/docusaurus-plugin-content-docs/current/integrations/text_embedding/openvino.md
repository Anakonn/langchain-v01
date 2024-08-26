---
translated: true
---

# OpenVINO

[OpenVINO™](https://github.com/openvinotoolkit/openvino) es un conjunto de herramientas de código abierto para optimizar y desplegar inferencia de IA. El tiempo de ejecución de OpenVINO™ admite varios [dispositivos](https://github.com/openvinotoolkit/openvino?tab=readme-ov-file#supported-hardware-matrix) de hardware, incluidos CPU x86 y ARM, e Intel GPU. Puede ayudar a impulsar el rendimiento del aprendizaje profundo en Visión Artificial, Reconocimiento Automático del Habla, Procesamiento del Lenguaje Natural y otras tareas comunes.

El modelo de incrustación de Hugging Face se puede admitir mediante la clase ``OpenVINOEmbeddings``. Si tiene una GPU Intel, puede especificar `model_kwargs={"device": "GPU"}` para ejecutar la inferencia en ella.

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

## Exportar modelo IR

Es posible exportar tu modelo de incrustación al formato IR de OpenVINO con ``OVModelForFeatureExtraction`` y cargar el modelo desde una carpeta local.

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

## BGE con OpenVINO

También podemos acceder a los modelos de incrustación de BGE a través de la clase ``OpenVINOBgeEmbeddings`` con OpenVINO.

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

Para más información, consulta:

* [Guía de OpenVINO LLM](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html).

* [Documentación de OpenVINO](https://docs.openvino.ai/2024/home.html).

* [Guía de inicio rápido de OpenVINO](https://www.intel.com/content/www/us/en/content-details/819067/openvino-get-started-guide.html).

* [Cuaderno de RAG con LangChain](https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/llm-rag-langchain).
