---
translated: true
---

# FastEmbed by Qdrant

>[FastEmbed](https://qdrant.github.io/fastembed/)는 [Qdrant](https://qdrant.tech)에서 제공하는 경량, 고속 Python 라이브러리로 임베딩 생성을 위해 설계되었습니다.
>
>- 양자화된 모델 가중치
>- ONNX Runtime, PyTorch 종속성 없음
>- CPU 중심 설계
>- 대용량 데이터셋 인코딩을 위한 데이터 병렬 처리.

## 의존성

LangChain에서 FastEmbed를 사용하려면 `fastembed` Python 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet  fastembed
```

## 가져오기

```python
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
```

## FastEmbed 인스턴스화

### 매개변수

- `model_name: str` (기본값: "BAAI/bge-small-en-v1.5")
    > 사용할 FastEmbedding 모델의 이름입니다. 지원되는 모델 목록은 [여기](https://qdrant.github.io/fastembed/examples/Supported_Models/)에서 확인할 수 있습니다.

- `max_length: int` (기본값: 512)
    > 최대 토큰 수입니다. 512를 초과하는 값에 대한 동작은 알 수 없습니다.

- `cache_dir: Optional[str]`
    > 캐시 디렉토리의 경로입니다. 기본값은 상위 디렉토리의 `local_cache`입니다.

- `threads: Optional[int]`
    > 단일 onnxruntime 세션이 사용할 수 있는 스레드 수입니다. 기본값은 None입니다.

- `doc_embed_type: Literal["default", "passage"]` (기본값: "default")
    > "default": FastEmbed의 기본 임베딩 방법을 사용합니다.

    > "passage": 텍스트 앞에 "passage"를 접두사로 붙여 임베딩합니다.

```python
embeddings = FastEmbedEmbeddings()
```

## 사용법

### 문서 임베딩 생성

```python
document_embeddings = embeddings.embed_documents(
    ["This is a document", "This is some other document"]
)
```

### 쿼리 임베딩 생성

```python
query_embeddings = embeddings.embed_query("This is a query")
```
