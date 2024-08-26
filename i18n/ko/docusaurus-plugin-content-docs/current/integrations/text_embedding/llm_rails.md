---
translated: true
---

# LLMRails

LLMRails Embeddings 클래스를 로드해 보겠습니다.

LLMRails 임베딩을 사용하려면 인수로 API 키를 전달하거나 `LLM_RAILS_API_KEY` 키로 환경에 설정해야 합니다.
API 키를 얻으려면 https://console.llmrails.com/signup에서 가입한 후 https://console.llmrails.com/api-keys로 이동하여 플랫폼에서 생성한 키를 복사해야 합니다.

```python
from langchain_community.embeddings import LLMRailsEmbeddings
```

```python
embeddings = LLMRailsEmbeddings(model="embedding-english-v1")  # or embedding-multi-v1
```

```python
text = "This is a test document."
```

임베딩을 생성하려면 개별 텍스트를 쿼리하거나 텍스트 목록을 쿼리할 수 있습니다.

```python
query_result = embeddings.embed_query(text)
query_result[:5]
```

```output
[-0.09996652603149414,
 0.015568195842206478,
 0.17670190334320068,
 0.16521021723747253,
 0.21193109452724457]
```

```python
doc_result = embeddings.embed_documents([text])
doc_result[0][:5]
```

```output
[-0.04242777079343796,
 0.016536075621843338,
 0.10052520781755447,
 0.18272875249385834,
 0.2079043835401535]
```
