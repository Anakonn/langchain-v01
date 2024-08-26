---
translated: true
---

# दस्तावेजों को अनुकूलित और मात्रात्मक एम्बेडर का उपयोग करके एम्बेड करना

मात्रात्मक एम्बेडर का उपयोग करके सभी दस्तावेजों को एम्बेड करना।

एम्बेडर [optimum-intel](https://github.com/huggingface/optimum-intel.git) और [IPEX](https://github.com/intel/intel-extension-for-pytorch) का उपयोग करके बनाए गए अनुकूलित मॉडल पर आधारित हैं।

उदाहरण पाठ [SBERT](https://www.sbert.net/docs/pretrained_cross-encoders.html) पर आधारित है।

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

चलो एक प्रश्न पूछें और दो दस्तावेजों की तुलना करें। पहला दस्तावेज प्रश्न का उत्तर देता है और दूसरा नहीं।

हम देख सकते हैं कि कौन सा हमारे प्रश्न के अनुकूल है।

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

हम देख सकते हैं कि वास्तव में पहला एक उच्च रैंक करता है।
