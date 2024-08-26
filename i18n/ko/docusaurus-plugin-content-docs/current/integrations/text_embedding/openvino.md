---
translated: true
---

# OpenVINO

[OpenVINO™](https://github.com/openvinotoolkit/openvino)은 AI 추론을 최적화하고 배포하기 위한 오픈 소스 툴킷입니다. OpenVINO™ Runtime은 x86 및 ARM CPU, Intel GPU를 포함한 다양한 하드웨어 [장치](https://github.com/openvinotoolkit/openvino?tab=readme-ov-file#supported-hardware-matrix)를 지원합니다. 컴퓨터 비전, 자동 음성 인식, 자연어 처리 및 기타 일반적인 작업에서 딥 러닝 성능을 높일 수 있습니다.

Hugging Face 임베딩 모델은 ``OpenVINOEmbeddings`` 클래스를 통해 OpenVINO로 지원될 수 있습니다. Intel GPU가 있는 경우 `model_kwargs={"device": "GPU"}`를 지정하여 GPU에서 추론을 실행할 수 있습니다.

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

## IR 모델 내보내기

``OVModelForFeatureExtraction``를 사용하여 임베딩 모델을 OpenVINO IR 형식으로 내보내고 로컬 폴더에서 모델을 로드할 수 있습니다.

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

## OpenVINO를 사용한 BGE

``OpenVINOBgeEmbeddings`` 클래스를 통해 OpenVINO로 BGE 임베딩 모델에 액세스할 수 있습니다.

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

자세한 내용은 다음을 참조하십시오:

* [OpenVINO LLM 가이드](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html).

* [OpenVINO 문서](https://docs.openvino.ai/2024/home.html).

* [OpenVINO 시작하기 가이드](https://www.intel.com/content/www/us/en/content-details/819067/openvino-get-started-guide.html).

* [LangChain을 사용한 RAG 노트북](https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/llm-rag-langchain).
