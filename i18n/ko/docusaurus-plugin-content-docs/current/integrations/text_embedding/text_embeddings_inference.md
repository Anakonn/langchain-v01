---
translated: true
---

# 텍스트 임베딩 추론

>[Hugging Face 텍스트 임베딩 추론(TEI)](https://huggingface.co/docs/text-embeddings-inference/index)은 오픈소스 텍스트 임베딩 및 시퀀스 분류 모델을 배포하고 서비스하는 도구입니다. `TEI`는 `FlagEmbedding`, `Ember`, `GTE` 및 `E5`를 포함한 가장 인기 있는 모델에 대한 고성능 추출을 가능하게 합니다.

langchain에서 사용하려면 먼저 `huggingface-hub`를 설치해야 합니다.

```python
%pip install --upgrade huggingface-hub
```

그런 다음 TEI를 사용하여 임베딩 모델을 노출시킵니다. 예를 들어 Docker를 사용하여 `BAAI/bge-large-en-v1.5`를 다음과 같이 서비스할 수 있습니다:

```bash
model=BAAI/bge-large-en-v1.5
revision=refs/pr/5
volume=$PWD/data # share a volume with the Docker container to avoid downloading weights every run

docker run --gpus all -p 8080:80 -v $volume:/data --pull always ghcr.io/huggingface/text-embeddings-inference:0.6 --model-id $model --revision $revision
```

마지막으로 클라이언트를 인스턴스화하고 텍스트를 임베딩합니다.

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
