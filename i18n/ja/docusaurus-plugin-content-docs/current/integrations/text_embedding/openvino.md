---
translated: true
---

# OpenVINO

[OpenVINO™](https://github.com/openvinotoolkit/openvino) は、AI推論の最適化とデプロイに使用できるオープンソースのツールキットです。OpenVINO™ ランタイムは、x86およびARM CPU、Intel GPUなどの様々なハードウェア[デバイス](https://github.com/openvinotoolkit/openvino?tab=readme-ov-file#supported-hardware-matrix)をサポートしています。コンピュータービジョン、音声認識、自然言語処理、その他の一般的なタスクでの深層学習のパフォーマンスを向上させることができます。

Hugging Faceの埋め込みモデルは、``OpenVINOEmbeddings``クラスを使ってOpenVINOでサポートできます。Intel GPUをお持ちの場合は、`model_kwargs={"device": "GPU"}`を指定して、GPUでの推論を行うことができます。

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

## IRモデルのエクスポート

``OVModelForFeatureExtraction``を使って、埋め込みモデルをOpenVINO IRフォーマットにエクスポートし、ローカルフォルダからモデルを読み込むことができます。

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

## OpenVINOを使ったBGE

``OpenVINOBgeEmbeddings``クラスを使って、BGEの埋め込みモデルにもアクセスできます。

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

詳細については以下を参照してください:

* [OpenVINO LLMガイド](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html)。

* [OpenVINOドキュメンテーション](https://docs.openvino.ai/2024/home.html)。

* [OpenVINO入門ガイド](https://www.intel.com/content/www/us/en/content-details/819067/openvino-get-started-guide.html)。

* [LangChainを使ったRAGノートブック](https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/llm-rag-langchain)。
