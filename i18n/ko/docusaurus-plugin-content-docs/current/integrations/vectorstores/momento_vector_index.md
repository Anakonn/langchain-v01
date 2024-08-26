---
translated: true
---

# 모멘토 벡터 인덱스 (MVI)

>[MVI](https://gomomento.com): 데이터를 위한 가장 생산적이고 사용하기 쉬운 서버리스 벡터 인덱스입니다. MVI 시작하기 위해서는 계정을 만들기만 하면 됩니다. 인프라를 처리하거나 서버를 관리할 필요가 없으며 확장에 대해 걱정할 필요도 없습니다. MVI는 자동으로 확장되어 사용자의 요구를 충족시킵니다.

MVI에 가입하고 액세스하려면 [Momento Console](https://console.gomomento.com)을 방문하세요.

# 설정

## 필수 구성 요소 설치

다음이 필요합니다:
- MVI와 상호 작용하기 위한 [`momento`](https://pypi.org/project/momento/) 패키지, 그리고
- OpenAI API와 상호 작용하기 위한 openai 패키지.
- 텍스트를 토큰화하기 위한 tiktoken 패키지.

```python
%pip install --upgrade --quiet  momento langchain-openai tiktoken
```

## API 키 입력

```python
import getpass
import os
```

### Momento: 데이터 인덱싱을 위해

[Momento Console](https://console.gomomento.com)에서 API 키를 얻으세요.

```python
os.environ["MOMENTO_API_KEY"] = getpass.getpass("Momento API Key:")
```

### OpenAI: 텍스트 임베딩을 위해

```python
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

# 데이터 로드

여기서는 Langchain의 예제 데이터셋인 국정 연설문을 사용합니다.

먼저 관련 모듈을 로드합니다:

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import MomentoVectorIndex
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

그런 다음 데이터를 로드합니다:

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
len(documents)
```

```output
1
```

데이터가 하나의 큰 파일이므로 문서가 하나뿐입니다:

```python
len(documents[0].page_content)
```

```output
38539
```

이 텍스트 파일이 하나의 큰 파일이므로, 질문 답변을 위해 청크로 나눕니다. 그래야 사용자 질문에 가장 관련성 있는 청크에서 답변할 수 있습니다.

```python
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
len(docs)
```

```output
42
```

# 데이터 인덱싱

데이터 인덱싱은 `MomentoVectorIndex` 객체를 인스턴스화하는 것만큼 간단합니다. 여기서는 `from_documents` 헬퍼를 사용하여 인스턴스화하고 데이터를 인덱싱합니다:

```python
vector_db = MomentoVectorIndex.from_documents(
    docs, OpenAIEmbeddings(), index_name="sotu"
)
```

이것은 API 키를 사용하여 Momento Vector Index 서비스에 연결하고 데이터를 인덱싱합니다. 인덱스가 이전에 존재하지 않았다면 이 과정에서 생성됩니다. 이제 데이터를 검색할 수 있습니다.

# 데이터 쿼리

## 인덱스에 직접 질문하기

데이터를 쿼리하는 가장 직접적인 방법은 인덱스를 검색하는 것입니다. 다음과 같이 `VectorStore` API를 사용하여 수행할 수 있습니다:

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
```

```python
docs[0].page_content
```

```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```

이 결과에는 Ketanji Brown Jackson에 대한 관련 정보가 포함되어 있지만, 간결하고 읽기 쉬운 답변은 아닙니다. 다음 섹션에서 이 문제를 해결하겠습니다.

## LLM을 사용하여 유창한 답변 생성

MVI에 데이터를 인덱싱하면 벡터 유사성 검색을 활용하는 모든 체인과 통합할 수 있습니다. 여기서는 `RetrievalQA` 체인을 사용하여 인덱싱된 데이터에서 질문에 답변하는 방법을 보여줍니다.

먼저 관련 모듈을 로드합니다:

```python
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI
```

그런 다음 검색 QA 체인을 인스턴스화합니다:

```python
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
qa_chain = RetrievalQA.from_chain_type(llm, retriever=vector_db.as_retriever())
```

```python
qa_chain({"query": "What did the president say about Ketanji Brown Jackson?"})
```

```output
{'query': 'What did the president say about Ketanji Brown Jackson?',
 'result': "The President said that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court. He described her as one of the nation's top legal minds and mentioned that she has received broad support from various groups, including the Fraternal Order of Police and former judges appointed by Democrats and Republicans."}
```

# 다음 단계

이것으로 데이터를 인덱싱하고 Momento Vector Index를 사용하여 쿼리할 수 있습니다. 벡터 유사성 검색을 지원하는 모든 체인에서 동일한 인덱스를 사용하여 데이터를 쿼리할 수 있습니다.

Momento를 사용하면 벡터 데이터를 인덱싱할 뿐만 아니라 API 호출을 캐시하고 채팅 메시지 기록을 저장할 수 있습니다. 다른 Momento Langchain 통합을 살펴보세요.

Momento Vector Index에 대해 자세히 알아보려면 [Momento 문서](https://docs.gomomento.com)를 방문하세요.
