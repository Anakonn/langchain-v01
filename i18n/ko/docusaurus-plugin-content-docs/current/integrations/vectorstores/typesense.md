---
translated: true
---

# Typesense

> [Typesense](https://typesense.org)는 오픈 소스 메모리 내 검색 엔진으로, [자체 호스팅](https://typesense.org/docs/guide/install-typesense#option-2-local-machine-self-hosting)하거나 [Typesense Cloud](https://cloud.typesense.org/)에서 실행할 수 있습니다.
>
> Typesense는 전체 인덱스를 RAM에 저장(디스크에 백업)하여 성능에 중점을 두며, 사용 가능한 옵션을 단순화하고 좋은 기본값을 설정하여 개발자 경험을 개선하는 데 초점을 맞추고 있습니다.
>
> 또한 속성 기반 필터링과 벡터 쿼리를 결합하여 가장 관련성 있는 문서를 가져올 수 있습니다.

이 노트북에서는 Typesense를 VectorStore로 사용하는 방법을 보여줍니다.

먼저 종속성을 설치해 보겠습니다:

```python
%pip install --upgrade --quiet  typesense openapi-schema-pydantic langchain-openai tiktoken
```

`OpenAIEmbeddings`를 사용하려면 OpenAI API 키를 얻어야 합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Typesense
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

테스트 데이터셋을 가져와 보겠습니다:

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
docsearch = Typesense.from_documents(
    docs,
    embeddings,
    typesense_client_params={
        "host": "localhost",  # Use xxx.a1.typesense.net for Typesense Cloud
        "port": "8108",  # Use 443 for Typesense Cloud
        "protocol": "http",  # Use https for Typesense Cloud
        "typesense_api_key": "xyz",
        "typesense_collection_name": "lang-chain",
    },
)
```

## 유사도 검색

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = docsearch.similarity_search(query)
```

```python
print(found_docs[0].page_content)
```

## Retriever로서의 Typesense

Typesense는 다른 벡터 저장소와 마찬가지로 코사인 유사도를 사용하는 LangChain Retriever입니다.

```python
retriever = docsearch.as_retriever()
retriever
```

```python
query = "What did the president say about Ketanji Brown Jackson"
retriever.invoke(query)[0]
```
