---
translated: true
---

# DingoDB

>[DingoDB](https://dingodb.readthedocs.io/en/latest/)는 데이터 레이크와 벡터 데이터베이스의 특성을 결합한 분산 멀티모드 벡터 데이터베이스입니다. 모든 유형과 크기의 데이터(Key-Value, PDF, 오디오, 비디오 등)를 저장할 수 있습니다. 실시간 저지연 처리 기능을 통해 신속한 통찰력과 대응을 달성할 수 있으며, 멀티모달 데이터를 효율적으로 즉시 분석하고 처리할 수 있습니다.

이 노트북은 DingoDB 벡터 데이터베이스와 관련된 기능을 사용하는 방법을 보여줍니다.

실행하려면 [DingoDB 인스턴스를 실행 중](https://github.com/dingodb/dingo-deploy/blob/main/README.md)이어야 합니다.

```python
%pip install --upgrade --quiet  dingodb
# or install latest:
%pip install --upgrade --quiet  git+https://git@github.com/dingodb/pydingo.git
```

OpenAIEmbeddings를 사용하려면 OpenAI API 키를 얻어야 합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key:········
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Dingo
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
from dingodb import DingoDB

index_name = "langchain_demo"

dingo_client = DingoDB(user="", password="", host=["127.0.0.1:13000"])
# First, check if our index already exists. If it doesn't, we create it
if (
    index_name not in dingo_client.get_index()
    and index_name.upper() not in dingo_client.get_index()
):
    # we create a new index, modify to your own
    dingo_client.create_index(
        index_name=index_name, dimension=1536, metric_type="cosine", auto_id=False
    )

# The OpenAI embedding model `text-embedding-ada-002 uses 1536 dimensions`
docsearch = Dingo.from_documents(
    docs, embeddings, client=dingo_client, index_name=index_name
)
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Dingo
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```python
print(docs[0].page_content)
```

### 기존 인덱스에 더 많은 텍스트 추가하기

`add_texts` 함수를 사용하여 기존 Dingo 인덱스에 텍스트를 임베딩하고 업서트할 수 있습니다.

```python
vectorstore = Dingo(embeddings, "text", client=dingo_client, index_name=index_name)

vectorstore.add_texts(["More text!"])
```

### 최대 한계 관련성 검색

retriever 객체에서 유사성 검색을 사용하는 것 외에도 `mmr`을 retriever로 사용할 수 있습니다.

```python
retriever = docsearch.as_retriever(search_type="mmr")
matched_docs = retriever.invoke(query)
for i, d in enumerate(matched_docs):
    print(f"\n## Document {i}\n")
    print(d.page_content)
```

또는 `max_marginal_relevance_search`를 직접 사용할 수 있습니다:

```python
found_docs = docsearch.max_marginal_relevance_search(query, k=2, fetch_k=10)
for i, doc in enumerate(found_docs):
    print(f"{i + 1}.", doc.page_content, "\n")
```
