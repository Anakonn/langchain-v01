---
translated: true
---

# 마이스케일

>[마이스케일](https://docs.myscale.com/en/overview/)은 오픈 소스 [ClickHouse](https://github.com/ClickHouse/ClickHouse)를 기반으로 구축된 AI 애플리케이션 및 솔루션을 위한 클라우드 기반 데이터베이스입니다.

이 노트북은 `마이스케일` 벡터 데이터베이스와 관련된 기능을 사용하는 방법을 보여줍니다.

## 환경 설정

```python
%pip install --upgrade --quiet  clickhouse-connect
```

OpenAIEmbeddings를 사용하려면 OpenAI API 키를 얻어야 합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["OPENAI_API_BASE"] = getpass.getpass("OpenAI Base:")
os.environ["MYSCALE_HOST"] = getpass.getpass("MyScale Host:")
os.environ["MYSCALE_PORT"] = getpass.getpass("MyScale Port:")
os.environ["MYSCALE_USERNAME"] = getpass.getpass("MyScale Username:")
os.environ["MYSCALE_PASSWORD"] = getpass.getpass("MyScale Password:")
```

마이스케일 인덱스에 대한 매개변수를 설정하는 두 가지 방법이 있습니다.

1. 환경 변수

    앱을 실행하기 전에 `export`로 환경 변수를 설정하십시오:
    `export MYSCALE_HOST='<your-endpoints-url>' MYSCALE_PORT=<your-endpoints-port> MYSCALE_USERNAME=<your-username> MYSCALE_PASSWORD=<your-password> ...`

    계정, 비밀번호 및 기타 정보는 SaaS에서 찾을 수 있습니다. 자세한 내용은 [이 문서](https://docs.myscale.com/en/cluster-management/)를 참조하십시오.

    `MyScaleSettings` 아래의 모든 속성은 `MYSCALE_` 접두사로 설정할 수 있으며 대소문자를 구분하지 않습니다.

2. `MyScaleSettings` 객체 생성

    ```python
    from langchain_community.vectorstores import MyScale, MyScaleSettings
    config = MyScaleSetting(host="<your-backend-url>", port=8443, ...)
    index = MyScale(embedding_function, config)
    index.add_documents(...)
    ```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import MyScale
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
for d in docs:
    d.metadata = {"some": "metadata"}
docsearch = MyScale.from_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:15<00:00,  2.66it/s]
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## 연결 정보 및 데이터 스키마 가져오기

```python
print(str(docsearch))
```

## 필터링

마이스케일 SQL `WHERE` 절에 직접 액세스할 수 있습니다. 표준 SQL을 따르는 `WHERE` 절을 작성할 수 있습니다.

**주의**: SQL 삽입에 주의해야 합니다. 이 인터페이스는 최종 사용자가 직접 호출해서는 안 됩니다.

`column_map`을 사용자 정의한 경우 다음과 같이 필터를 검색할 수 있습니다:

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import MyScale

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

for i, d in enumerate(docs):
    d.metadata = {"doc_id": i}

docsearch = MyScale.from_documents(docs, embeddings)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:15<00:00,  2.68it/s]
```

### 유사도 검색 및 점수

반환된 거리 점수는 코사인 거리입니다. 따라서 점수가 낮을수록 더 좋습니다.

```python
meta = docsearch.metadata_column
output = docsearch.similarity_search_with_relevance_scores(
    "What did the president say about Ketanji Brown Jackson?",
    k=4,
    where_str=f"{meta}.doc_id<10",
)
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")
```

```output
0.229655921459198 {'doc_id': 0} Madam Speaker, Madam...
0.24506962299346924 {'doc_id': 8} And so many families...
0.24786919355392456 {'doc_id': 1} Groups of citizens b...
0.24875116348266602 {'doc_id': 6} And I’m taking robus...
```

## 데이터 삭제

`.drop()` 메서드로 테이블을 삭제하거나 `.delete()` 메서드로 데이터를 부분적으로 삭제할 수 있습니다.

```python
# use directly a `where_str` to delete
docsearch.delete(where_str=f"{docsearch.metadata_column}.doc_id < 5")
meta = docsearch.metadata_column
output = docsearch.similarity_search_with_relevance_scores(
    "What did the president say about Ketanji Brown Jackson?",
    k=4,
    where_str=f"{meta}.doc_id<10",
)
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")
```

```output
0.24506962299346924 {'doc_id': 8} And so many families...
0.24875116348266602 {'doc_id': 6} And I’m taking robus...
0.26027143001556396 {'doc_id': 7} We see the unity amo...
0.26390212774276733 {'doc_id': 9} And unlike the $2 Tr...
```

```python
docsearch.drop()
```
