---
translated: true
---

# ERNIE

[ERNIE Embedding-V1](https://cloud.baidu.com/doc/WENXINWORKSHOP/s/alj562vvu)은 `Baidu Wenxin` 대규모 모델 기술을 기반으로 한 텍스트 표현 모델로, 텍스트를 숫자 값으로 표현된 벡터 형태로 변환하며, 텍스트 검색, 정보 추천, 지식 마이닝 등의 시나리오에 사용됩니다.

**Deprecated Warning**

`langchain_community.embeddings.ErnieEmbeddings`를 사용하는 사용자들에게 `langchain_community.embeddings.QianfanEmbeddingsEndpoint`를 사용하는 것을 권장합니다.

`QianfanEmbeddingsEndpoint`에 대한 문서는 [여기](/docs/integrations/text_embedding/baidu_qianfan_endpoint/)에서 확인할 수 있습니다.

`QianfanEmbeddingsEndpoint`를 사용하는 것을 권장하는 이유는 다음과 같습니다:

1. `QianfanEmbeddingsEndpoint`는 Qianfan 플랫폼의 더 많은 임베딩 모델을 지원합니다.
2. `ErnieEmbeddings`는 유지 보수가 부족하고 deprecated되었습니다.

마이그레이션을 위한 팁:

```python
from langchain_community.embeddings import QianfanEmbeddingsEndpoint

embeddings = QianfanEmbeddingsEndpoint(
    qianfan_ak="your qianfan ak",
    qianfan_sk="your qianfan sk",
)
```

## Usage

```python
from langchain_community.embeddings import ErnieEmbeddings
```

```python
embeddings = ErnieEmbeddings()
```

```python
query_result = embeddings.embed_query("foo")
```

```python
doc_results = embeddings.embed_documents(["foo"])
```
