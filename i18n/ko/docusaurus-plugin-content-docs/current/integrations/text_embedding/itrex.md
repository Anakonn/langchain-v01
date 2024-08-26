---
translated: true
---

# Intel® Extension for Transformers 양자화된 텍스트 임베딩

[Intel® Extension for Transformers](https://github.com/intel/intel-extension-for-transformers) (ITREX)에서 생성된 양자화된 BGE 임베딩 모델을 로드하고 ITREX [Neural Engine](https://github.com/intel/intel-extension-for-transformers/blob/main/intel_extension_for_transformers/llm/runtime/deprecated/docs/Installation.md), 고성능 NLP 백엔드를 사용하여 모델의 정확도를 저하시키지 않고 추론을 가속화할 수 있습니다.

[Intel Extension for Transformers를 사용한 효율적인 자연어 임베딩 모델](https://medium.com/intel-analytics-software/efficient-natural-language-embedding-models-with-intel-extension-for-transformers-2b6fcd0f8f34) 블로그와 [BGE 최적화 예제](https://github.com/intel/intel-extension-for-transformers/tree/main/examples/huggingface/pytorch/text-embedding/deployment/mteb/bge)에서 자세한 내용을 확인할 수 있습니다.

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

## 사용법

```python
text = "This is a test document."
query_result = model.embed_query(text)
doc_result = model.embed_documents([text])
```
