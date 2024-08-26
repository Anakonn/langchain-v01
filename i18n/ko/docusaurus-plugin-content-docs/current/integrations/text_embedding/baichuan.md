---
translated: true
---

# 백천 텍스트 임베딩

오늘 (2024년 1월 25일) 기준 BaichuanTextEmbeddings는 C-MTEB (중국어 멀티 태스크 임베딩 벤치마크) 리더보드에서 1위를 차지하고 있습니다.

리더보드 (전체 -> 중국어 섹션): https://huggingface.co/spaces/mteb/leaderboard

공식 웹사이트: https://platform.baichuan-ai.com/docs/text-Embedding

이 임베딩 모델을 사용하려면 API 키가 필요합니다. https://platform.baichuan-ai.com/docs/text-Embedding에서 등록하여 API 키를 받을 수 있습니다.

BaichuanTextEmbeddings는 512 토큰 창과 1024 차원의 벡터를 지원합니다.

BaichuanTextEmbeddings는 중국어 텍스트 임베딩만 지원한다는 점에 유의하시기 바랍니다. 다국어 지원은 곧 제공될 예정입니다.

```python
from langchain_community.embeddings import BaichuanTextEmbeddings

embeddings = BaichuanTextEmbeddings(baichuan_api_key="sk-*")
```

또한 다음과 같은 방식으로 API 키를 설정할 수 있습니다:

```python
import os

os.environ["BAICHUAN_API_KEY"] = "YOUR_API_KEY"
```

```python
text_1 = "今天天气不错"
text_2 = "今天阳光很好"

query_result = embeddings.embed_query(text_1)
query_result
```

```python
doc_result = embeddings.embed_documents([text_1, text_2])
doc_result
```
