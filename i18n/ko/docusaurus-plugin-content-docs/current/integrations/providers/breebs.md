---
translated: true
---

# Breebs (오픈 지식)

>[Breebs](https://www.breebs.com/)는 오픈 협업 지식 플랫폼입니다.
>누구나 Google Drive 폴더에 저장된 PDF 파일을 기반으로 `Breeb`이라는 지식 캡슐을 만들 수 있습니다.
>`Breeb`은 LLM/챗봇이 전문성을 높이고 환각을 줄이며 출처에 접근할 수 있도록 사용될 수 있습니다.
>내부적으로 `Breebs`는 여러 `Retrieval Augmented Generation (RAG)` 모델을 구현하여
> 각 반복 단계에서 유용한 컨텍스트를 원활하게 제공합니다.

## Retriever

```python
from langchain.retrievers import BreebsRetriever
```

[사용 예시 보기 (Retrieval & ConversationalRetrievalChain)](/docs/integrations/retrievers/breebs)
