---
translated: true
---

# Dria

>[Dria](https://dria.co/)는 개발자들이 공유 임베딩 레이크에 기여하고 활용할 수 있는 공개 RAG 모델의 허브입니다. 이 노트북은 데이터 검색 작업을 위한 `Dria API` 사용 방법을 보여줍니다.

# 설치

`dria` 패키지가 설치되어 있는지 확인하세요. pip를 사용하여 설치할 수 있습니다:

```python
%pip install --upgrade --quiet dria
```

# API 키 구성

액세스를 위해 Dria API 키를 설정하세요.

```python
import os

os.environ["DRIA_API_KEY"] = "DRIA_API_KEY"
```

# Dria Retriever 초기화

`DriaRetriever` 인스턴스를 생성합니다.

```python
from langchain.retrievers import DriaRetriever

api_key = os.getenv("DRIA_API_KEY")
retriever = DriaRetriever(api_key=api_key)
```

# **지식 베이스 생성**

[Dria의 Knowledge Hub](https://dria.co/knowledge)에서 지식 베이스를 생성하세요.

```python
contract_id = retriever.create_knowledge_base(
    name="France's AI Development",
    embedding=DriaRetriever.models.jina_embeddings_v2_base_en.value,
    category="Artificial Intelligence",
    description="Explore the growth and contributions of France in the field of Artificial Intelligence.",
)
```

# 데이터 추가

데이터를 Dria 지식 베이스에 로드하세요.

```python
texts = [
    "The first text to add to Dria.",
    "Another piece of information to store.",
    "More data to include in the Dria knowledge base.",
]

ids = retriever.add_texts(texts)
print("Data added with IDs:", ids)
```

# 데이터 검색

retriever를 사용하여 쿼리에 대한 관련 문서를 찾으세요.

```python
query = "Find information about Dria."
result = retriever.invoke(query)
for doc in result:
    print(doc)
```
