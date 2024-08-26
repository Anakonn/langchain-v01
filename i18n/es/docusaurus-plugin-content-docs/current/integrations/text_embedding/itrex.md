---
translated: true
---

# Intel® Extension for Transformers Cuantificados Incrustaciones de Texto

Carga modelos de incrustación BGE cuantificados generados por [Intel® Extension for Transformers](https://github.com/intel/intel-extension-for-transformers) (ITREX) y usa el [Neural Engine](https://github.com/intel/intel-extension-for-transformers/blob/main/intel_extension_for_transformers/llm/runtime/deprecated/docs/Installation.md) de ITREX, un backend de NLP de alto rendimiento, para acelerar la inferencia de modelos sin comprometer la precisión.

Consulta nuestro blog sobre [Modelos de incrustación de lenguaje natural eficientes con Intel Extension for Transformers](https://medium.com/intel-analytics-software/efficient-natural-language-embedding-models-with-intel-extension-for-transformers-2b6fcd0f8f34) y el [ejemplo de optimización de BGE](https://github.com/intel/intel-extension-for-transformers/tree/main/examples/huggingface/pytorch/text-embedding/deployment/mteb/bge) para más detalles.

```python
from langchain_community.embeddings import QuantizedBgeEmbeddings

model_name = "Intel/bge-small-en-v1.5-sts-int8-static-inc"
encode_kwargs = {"normalize_embeddings": True}  # set True to compute cosine similarity

model = QuantizedBgeEmbeddings(
    model_name=model_name,
    encode_kwargs=encode_kwargs,
    query_instruction="Represent this sentence for searching relevant passages: ",
)
```

```output
/home/yuwenzho/.conda/envs/bge/lib/python3.9/site-packages/tqdm/auto.py:21: TqdmWarning: IProgress not found. Please update jupyter and ipywidgets. See https://ipywidgets.readthedocs.io/en/stable/user_install.html
  from .autonotebook import tqdm as notebook_tqdm
2024-03-04 10:17:17 [INFO] Start to extarct onnx model ops...
2024-03-04 10:17:17 [INFO] Extract onnxruntime model done...
2024-03-04 10:17:17 [INFO] Start to implement Sub-Graph matching and replacing...
2024-03-04 10:17:18 [INFO] Sub-Graph match and replace done...
```

## uso

```python
text = "This is a test document."
query_result = model.embed_query(text)
doc_result = model.embed_documents([text])
```
