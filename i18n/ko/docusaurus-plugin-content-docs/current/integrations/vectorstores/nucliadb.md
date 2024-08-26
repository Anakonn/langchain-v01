---
translated: true
---

# NucliaDB

로컬 NucliaDB 인스턴스를 사용하거나 [Nuclia Cloud](https://nuclia.cloud)를 사용할 수 있습니다.

로컬 인스턴스를 사용할 때는 Nuclia Understanding API 키가 필요하므로 텍스트가 올바르게 벡터화되고 색인됩니다. [https://nuclia.cloud](https://nuclia.cloud)에서 무료 계정을 만들고 [NUA 키를 생성](https://docs.nuclia.dev/docs/docs/using/understanding/intro)하여 키를 얻을 수 있습니다.

```python
%pip install --upgrade --quiet  langchain nuclia
```

## nuclia.cloud 사용법

```python
from langchain_community.vectorstores.nucliadb import NucliaDB

API_KEY = "YOUR_API_KEY"

ndb = NucliaDB(knowledge_box="YOUR_KB_ID", local=False, api_key=API_KEY)
```

## 로컬 인스턴스 사용법

참고: 기본적으로 `backend`는 `http://localhost:8080`으로 설정됩니다.

```python
from langchain_community.vectorstores.nucliadb import NucliaDB

ndb = NucliaDB(knowledge_box="YOUR_KB_ID", local=True, backend="http://my-local-server")
```

## 지식 상자에 텍스트 추가 및 삭제

```python
ids = ndb.add_texts(["This is a new test", "This is a second test"])
```

```python
ndb.delete(ids=ids)
```

## 지식 상자에서 검색하기

```python
results = ndb.similarity_search("Who was inspired by Ada Lovelace?")
print(results[0].page_content)
```
