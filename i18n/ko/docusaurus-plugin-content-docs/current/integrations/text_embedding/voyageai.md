---
translated: true
---

# 보야지 AI

>[보야지 AI](https://www.voyageai.com/)는 최첨단 임베딩/벡터화 모델을 제공합니다.

보야지 AI 임베딩 클래스를 로드해 보겠습니다. (LangChain 파트너 패키지를 `pip install langchain-voyageai`로 설치하세요)

```python
from langchain_voyageai import VoyageAIEmbeddings
```

보야지 AI는 사용량 모니터링과 권한 관리를 위해 API 키를 사용합니다. 키를 얻으려면 [홈페이지](https://www.voyageai.com)에서 계정을 만드세요. 그런 다음 API 키로 VoyageEmbeddings 모델을 생성하세요. 다음 모델 중 하나를 사용할 수 있습니다: ([source](https://docs.voyageai.com/docs/embeddings)):

- `voyage-large-2` (기본값)
- `voyage-code-2`
- `voyage-2`
- `voyage-law-2`
- `voyage-lite-02-instruct`

```python
embeddings = VoyageAIEmbeddings(
    voyage_api_key="[ Your Voyage API key ]", model="voyage-law-2"
)
```

문서를 준비하고 `embed_documents`를 사용하여 임베딩을 가져옵니다.

```python
documents = [
    "Caching embeddings enables the storage or temporary caching of embeddings, eliminating the necessity to recompute them each time.",
    "An LLMChain is a chain that composes basic LLM functionality. It consists of a PromptTemplate and a language model (either an LLM or chat model). It formats the prompt template using the input key values provided (and also memory key values, if available), passes the formatted string to LLM and returns the LLM output.",
    "A Runnable represents a generic unit of work that can be invoked, batched, streamed, and/or transformed.",
]
```

```python
documents_embds = embeddings.embed_documents(documents)
```

```python
documents_embds[0][:5]
```

```output
[0.0562174916267395,
 0.018221192061901093,
 0.0025736060924828053,
 -0.009720131754875183,
 0.04108370840549469]
```

마찬가지로 `embed_query`를 사용하여 쿼리를 임베딩합니다.

```python
query = "What's an LLMChain?"
```

```python
query_embd = embeddings.embed_query(query)
```

```python
query_embd[:5]
```

```output
[-0.0052348352037370205,
 -0.040072452276945114,
 0.0033957737032324076,
 0.01763271726667881,
 -0.019235141575336456]
```

## 최소한의 검색 시스템

임베딩의 주요 기능은 두 임베딩 간의 코사인 유사도가 해당 원본 문장의 의미적 관련성을 포착한다는 것입니다. 이를 통해 임베딩을 사용하여 의미 기반 검색/검색을 수행할 수 있습니다.

문서 임베딩에서 코사인 유사도에 따라 가장 가까운 몇 개의 임베딩을 찾고, LangChain의 `KNNRetriever` 클래스를 사용하여 해당 문서를 검색할 수 있습니다.

```python
from langchain.retrievers import KNNRetriever

retriever = KNNRetriever.from_texts(documents, embeddings)

# retrieve the most relevant documents
result = retriever.invoke(query)
top1_retrieved_doc = result[0].page_content  # return the top1 retrieved result

print(top1_retrieved_doc)
```

```output
An LLMChain is a chain that composes basic LLM functionality. It consists of a PromptTemplate and a language model (either an LLM or chat model). It formats the prompt template using the input key values provided (and also memory key values, if available), passes the formatted string to LLM and returns the LLM output.
```
