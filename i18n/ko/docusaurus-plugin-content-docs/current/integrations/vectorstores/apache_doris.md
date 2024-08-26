---
translated: true
---

# Apache Doris

>[Apache Doris](https://doris.apache.org/)는 실시간 분석을 위한 현대적인 데이터 웨어하우스입니다.
실시간 데이터에 대한 빠른 분석을 제공합니다.

>일반적으로 `Apache Doris`는 OLAP 범주에 속하며, [ClickBench — a Benchmark For Analytical DBMS](https://benchmark.clickhouse.com/)에서 뛰어난 성능을 보여주었습니다. 슈퍼 빠른 벡터화된 실행 엔진을 가지고 있어 빠른 벡터 데이터베이스로도 사용될 수 있습니다.

여기서는 Apache Doris 벡터 스토어 사용 방법을 보여드리겠습니다.

## 설정

```python
%pip install --upgrade --quiet  pymysql
```

문서가 업데이트되지 않은 경우 `update_vectordb = False`로 설정합니다. 그러면 문서 임베딩을 다시 빌드할 필요가 없습니다.

```python
!pip install  sqlalchemy
!pip install langchain
```

```python
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import (
    DirectoryLoader,
    UnstructuredMarkdownLoader,
)
from langchain_community.vectorstores.apache_doris import (
    ApacheDoris,
    ApacheDorisSettings,
)
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import TokenTextSplitter

update_vectordb = False
```

## 문서 로드 및 토큰으로 분할

`docs` 디렉토리 아래의 모든 Markdown 파일을 로드합니다.

Apache Doris 문서의 경우 https://github.com/apache/doris 에서 리포지토리를 클론할 수 있으며, 그 안에 `docs` 디렉토리가 있습니다.

```python
loader = DirectoryLoader(
    "./docs", glob="**/*.md", loader_cls=UnstructuredMarkdownLoader
)
documents = loader.load()
```

문서를 토큰으로 분할하고 새로운 문서/토큰이 있으므로 `update_vectordb = True`로 설정합니다.

```python
# load text splitter and split docs into snippets of text
text_splitter = TokenTextSplitter(chunk_size=400, chunk_overlap=50)
split_docs = text_splitter.split_documents(documents)

# tell vectordb to update text embeddings
update_vectordb = True
```

split_docs[-20]

print("# docs  = %d, # splits = %d" % (len(documents), len(split_docs)))

## 벡터 데이터베이스 인스턴스 생성

### Apache Doris를 벡터 데이터베이스로 사용

```python
def gen_apache_doris(update_vectordb, embeddings, settings):
    if update_vectordb:
        docsearch = ApacheDoris.from_documents(split_docs, embeddings, config=settings)
    else:
        docsearch = ApacheDoris(embeddings, settings)
    return docsearch
```

## 토큰을 임베딩으로 변환하고 벡터 데이터베이스에 저장

여기서는 Apache Doris를 벡터 데이터베이스로 사용합니다. `ApacheDorisSettings`를 통해 Apache Doris 인스턴스를 구성할 수 있습니다.

Apache Doris 인스턴스 구성은 MySQL 인스턴스 구성과 매우 유사합니다. 다음을 지정해야 합니다:
1. host/port
2. username(기본값: 'root')
3. password(기본값: '')
4. database(기본값: 'default')
5. table(기본값: 'langchain')

```python
import os
from getpass import getpass

os.environ["OPENAI_API_KEY"] = getpass()
```

```python
update_vectordb = True

embeddings = OpenAIEmbeddings()

# configure Apache Doris settings(host/port/user/pw/db)
settings = ApacheDorisSettings()
settings.port = 9030
settings.host = "172.30.34.130"
settings.username = "root"
settings.password = ""
settings.database = "langchain"
docsearch = gen_apache_doris(update_vectordb, embeddings, settings)

print(docsearch)

update_vectordb = False
```

## QA 빌드 및 질문 하기

```python
llm = OpenAI()
qa = RetrievalQA.from_chain_type(
    llm=llm, chain_type="stuff", retriever=docsearch.as_retriever()
)
query = "what is apache doris"
resp = qa.run(query)
print(resp)
```
