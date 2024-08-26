---
translated: true
---

# 最適化および量子化されたエンベッダーを使用したドキュメントの埋め込み

量子化されたエンベッダーを使用してすべてのドキュメントを埋め込みます。

エンベッダーは、[optimum-intel](https://github.com/huggingface/optimum-intel.git)と[IPEX](https://github.com/intel/intel-extension-for-pytorch)を使用して作成された最適化されたモデルに基づいています。

サンプルテキストは[SBERT](https://www.sbert.net/docs/pretrained_cross-encoders.html)に基づいています。

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

質問をして、2つのドキュメントと比較しましょう。最初のドキュメントには質問の答えが含まれており、2つ目のドキュメントには含まれていません。

クエリに最も適したものを確認できます。

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

最初のドキュメントの方が高順位であることがわかります。
