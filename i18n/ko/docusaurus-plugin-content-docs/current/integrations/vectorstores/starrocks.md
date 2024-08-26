---
translated: true
---

# 스타 록스

>[스타 록스](https://www.starrocks.io/)는 고성능 분석 데이터베이스입니다.
`스타 록스`는 다차원 분석, 실시간 분석 및 임시 쿼리를 포함한 전체 분석 시나리오를 위한 차세대 서브 초 MPP 데이터베이스입니다.

>일반적으로 `스타 록스`는 OLAP에 분류되며, [ClickBench - 분석 DBMS를 위한 벤치마크](https://benchmark.clickhouse.com/)에서 뛰어난 성능을 보여주었습니다. 슈퍼 고속 벡터화된 실행 엔진을 가지고 있어 빠른 벡터 데이터베이스로도 사용될 수 있습니다.

여기서는 스타 록스 벡터 스토어 사용 방법을 보여드리겠습니다.

## 설정

```python
%pip install --upgrade --quiet  pymysql
```

문서가 업데이트되지 않은 경우 `update_vectordb = False`로 설정합니다. 그러면 문서 임베딩을 다시 빌드할 필요가 없습니다.

```python
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import (
    DirectoryLoader,
    UnstructuredMarkdownLoader,
)
from langchain_community.vectorstores import StarRocks
from langchain_community.vectorstores.starrocks import StarRocksSettings
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import TokenTextSplitter

update_vectordb = False
```

```output
/Users/dirlt/utils/py3env/lib/python3.9/site-packages/requests/__init__.py:102: RequestsDependencyWarning: urllib3 (1.26.7) or chardet (5.1.0)/charset_normalizer (2.0.9) doesn't match a supported version!
  warnings.warn("urllib3 ({}) or chardet ({})/charset_normalizer ({}) doesn't match a supported "
```

## 문서 로드 및 토큰화

`docs` 디렉토리의 모든 마크다운 파일 로드

스타 록스 문서의 경우 https://github.com/StarRocks/starrocks 에서 리포지토리를 클론하면 `docs` 디렉토리가 있습니다.

```python
loader = DirectoryLoader(
    "./docs", glob="**/*.md", loader_cls=UnstructuredMarkdownLoader
)
documents = loader.load()
```

문서를 토큰으로 분할하고 새 문서/토큰이 있으므로 `update_vectordb = True`로 설정합니다.

```python
# load text splitter and split docs into snippets of text
text_splitter = TokenTextSplitter(chunk_size=400, chunk_overlap=50)
split_docs = text_splitter.split_documents(documents)

# tell vectordb to update text embeddings
update_vectordb = True
```

```python
split_docs[-20]
```

```output
Document(page_content='Compile StarRocks with Docker\n\nThis topic describes how to compile StarRocks using Docker.\n\nOverview\n\nStarRocks provides development environment images for both Ubuntu 22.04 and CentOS 7.9. With the image, you can launch a Docker container and compile StarRocks in the container.\n\nStarRocks version and DEV ENV image\n\nDifferent branches of StarRocks correspond to different development environment images provided on StarRocks Docker Hub.\n\nFor Ubuntu 22.04:\n\n| Branch name | Image name              |\n  | --------------- | ----------------------------------- |\n  | main            | starrocks/dev-env-ubuntu:latest     |\n  | branch-3.0      | starrocks/dev-env-ubuntu:3.0-latest |\n  | branch-2.5      | starrocks/dev-env-ubuntu:2.5-latest |\n\nFor CentOS 7.9:\n\n| Branch name | Image name                       |\n  | --------------- | ------------------------------------ |\n  | main            | starrocks/dev-env-centos7:latest     |\n  | branch-3.0      | starrocks/dev-env-centos7:3.0-latest |\n  | branch-2.5      | starrocks/dev-env-centos7:2.5-latest |\n\nPrerequisites\n\nBefore compiling StarRocks, make sure the following requirements are satisfied:\n\nHardware\n\n', metadata={'source': 'docs/developers/build-starrocks/Build_in_docker.md'})
```

```python
print("# docs  = %d, # splits = %d" % (len(documents), len(split_docs)))
```

```output
# docs  = 657, # splits = 2802
```

## 벡터 데이터베이스 인스턴스 생성

### 스타 록스를 벡터 데이터베이스로 사용

```python
def gen_starrocks(update_vectordb, embeddings, settings):
    if update_vectordb:
        docsearch = StarRocks.from_documents(split_docs, embeddings, config=settings)
    else:
        docsearch = StarRocks(embeddings, settings)
    return docsearch
```

## 토큰을 임베딩으로 변환하고 벡터 데이터베이스에 저장

여기서는 스타 록스를 벡터 데이터베이스로 사용합니다. `StarRocksSettings`를 통해 스타 록스 인스턴스를 구성할 수 있습니다.

스타 록스 인스턴스 구성은 MySQL 인스턴스 구성과 매우 유사합니다. 다음을 지정해야 합니다:
1. host/port
2. username(기본값: 'root')
3. password(기본값: '')
4. database(기본값: 'default')
5. table(기본값: 'langchain')

```python
embeddings = OpenAIEmbeddings()

# configure starrocks settings(host/port/user/pw/db)
settings = StarRocksSettings()
settings.port = 41003
settings.host = "127.0.0.1"
settings.username = "root"
settings.password = ""
settings.database = "zya"
docsearch = gen_starrocks(update_vectordb, embeddings, settings)

print(docsearch)

update_vectordb = False
```

```output
Inserting data...: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 2802/2802 [02:26<00:00, 19.11it/s]

[92m[1mzya.langchain @ 127.0.0.1:41003[0m

[1musername: root[0m

Table Schema:
----------------------------------------------------------------------------
|[94mname                    [0m|[96mtype                    [0m|[96mkey                     [0m|
----------------------------------------------------------------------------
|[94mid                      [0m|[96mvarchar(65533)          [0m|[96mtrue                    [0m|
|[94mdocument                [0m|[96mvarchar(65533)          [0m|[96mfalse                   [0m|
|[94membedding               [0m|[96marray<float>            [0m|[96mfalse                   [0m|
|[94mmetadata                [0m|[96mvarchar(65533)          [0m|[96mfalse                   [0m|
----------------------------------------------------------------------------
```

## QA 빌드 및 질문 하기

```python
llm = OpenAI()
qa = RetrievalQA.from_chain_type(
    llm=llm, chain_type="stuff", retriever=docsearch.as_retriever()
)
query = "is profile enabled by default? if not, how to enable profile?"
resp = qa.run(query)
print(resp)
```

```output
 No, profile is not enabled by default. To enable profile, set the variable `enable_profile` to `true` using the command `set enable_profile = true;`
```
