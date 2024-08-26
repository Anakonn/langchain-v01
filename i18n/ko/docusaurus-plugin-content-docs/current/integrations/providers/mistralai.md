---
translated: true
---

# MistralAI

Mistral AI는 강력한 오픈 소스 모델을 호스팅하는 플랫폼입니다.

[API](https://docs.mistral.ai/api/)를 통해 이에 접근할 수 있습니다.

API와 통신하려면 유효한 [API 키](https://console.mistral.ai/users/api-keys/)가 필요합니다.

`langchain-mistralai` 패키지도 필요합니다:

```python
%pip install -qU langchain-core langchain-mistralai
```

```python
from langchain_mistralai import ChatMistralAI, MistralAIEmbeddings
```

다음 문서를 참고하세요:

- [Chat Model](/docs/integrations/chat/mistralai)
- [Embeddings Model](/docs/integrations/text_embedding/mistralai)
