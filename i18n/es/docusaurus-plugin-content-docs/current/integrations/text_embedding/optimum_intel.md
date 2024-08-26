---
translated: true
---

# Incrustación de documentos utilizando Embedders optimizados y cuantizados

Incrustar todos los documentos utilizando Embedders cuantizados.

Los embedders se basan en modelos optimizados, creados mediante el uso de [optimum-intel](https://github.com/huggingface/optimum-intel.git) y [IPEX](https://github.com/intel/intel-extension-for-pytorch).

El texto de ejemplo se basa en [SBERT](https://www.sbert.net/docs/pretrained_cross-encoders.html).

```python
from langchain_community.embeddings import QuantizedBiEncoderEmbeddings

model_name = "Intel/bge-small-en-v1.5-rag-int8-static"
encode_kwargs = {"normalize_embeddings": True}  # set True to compute cosine similarity

model = QuantizedBiEncoderEmbeddings(
    model_name=model_name,
    encode_kwargs=encode_kwargs,
    query_instruction="Represent this sentence for searching relevant passages: ",
)
```

```output
loading configuration file inc_config.json from cache at
INCConfig {
  "distillation": {},
  "neural_compressor_version": "2.4.1",
  "optimum_version": "1.16.2",
  "pruning": {},
  "quantization": {
    "dataset_num_samples": 50,
    "is_static": true
  },
  "save_onnx_model": false,
  "torch_version": "2.2.0",
  "transformers_version": "4.37.2"
}

Using `INCModel` to load a TorchScript model will be deprecated in v1.15.0, to load your model please use `IPEXModel` instead.
```

Hagamos una pregunta y comparemos con 2 documentos. El primero contiene la respuesta a la pregunta y el segundo no.

Podemos comprobar qué se ajusta mejor a nuestra consulta.

```python
question = "How many people live in Berlin?"
```

```python
documents = [
    "Berlin had a population of 3,520,031 registered inhabitants in an area of 891.82 square kilometers.",
    "Berlin is well known for its museums.",
]
```

```python
doc_vecs = model.embed_documents(documents)
```

```output
Batches: 100%|██████████| 1/1 [00:00<00:00,  4.18it/s]
```

```python
query_vec = model.embed_query(question)
```

```python
import torch
```

```python
doc_vecs_torch = torch.tensor(doc_vecs)
```

```python
query_vec_torch = torch.tensor(query_vec)
```

```python
query_vec_torch @ doc_vecs_torch.T
```

```output
tensor([0.7980, 0.6529])
```

Podemos ver que, efectivamente, el primero tiene una clasificación más alta.
