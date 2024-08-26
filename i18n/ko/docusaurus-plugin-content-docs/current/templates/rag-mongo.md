---
translated: true
---

# rag-mongo

이 템플릿은 MongoDB와 OpenAI를 사용하여 RAG를 수행합니다.

## 환경 설정

두 개의 환경 변수를 내보내야 합니다. 하나는 MongoDB URI이고 다른 하나는 OpenAI API 키입니다.
MongoDB URI가 없는 경우 아래의 `Mongo 설정` 섹션을 참조하여 방법을 확인하세요.

```shell
export MONGO_URI=...
export OPENAI_API_KEY=...
```

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package rag-mongo
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add rag-mongo
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_mongo import chain as rag_mongo_chain

add_routes(app, rag_mongo_chain, path="/rag-mongo")
```

인제스트 파이프라인을 설정하려면 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_mongo import ingest as rag_mongo_ingest

add_routes(app, rag_mongo_ingest, path="/rag-mongo-ingest")
```

(선택 사항) 이제 LangSmith를 구성해 보겠습니다.
LangSmith는 LangChain 애플리케이션을 추적, 모니터링 및 디버깅하는 데 도움이 됩니다.
[여기](https://smith.langchain.com/)에서 LangSmith에 가입할 수 있습니다.
액세스 권한이 없는 경우 이 섹션을 건너뛸 수 있습니다.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

이미 연결하고 싶은 Mongo 검색 인덱스가 없는 경우 진행하기 전에 아래 `MongoDB 설정` 섹션을 참조하세요.

이미 연결하고 싶은 MongoDB 검색 인덱스가 있는 경우 `rag_mongo/chain.py`에서 연결 세부 정보를 편집하세요.

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 시작할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 볼 수 있습니다.
[http://127.0.0.1:8000/rag-mongo/playground](http://127.0.0.1:8000/rag-mongo/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스하려면 다음과 같이 하면 됩니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-mongo")
```

추가 정보는 [이 노트북](https://colab.research.google.com/drive/1cr2HBAHyBmwKUerJq2if0JaNhy-hIq7I#scrollTo=TZp7_CBfxTOB)을 참조하세요.

## MongoDB 설정

MongoDB 계정을 설정하고 데이터를 인제스트해야 하는 경우 이 단계를 사용하세요.
먼저 [여기](https://www.mongodb.com/docs/atlas/getting-started/)의 표준 MongoDB Atlas 설정 지침을 따르겠습니다.

1. 계정을 만듭니다(아직 안 했다면).
2. 새 프로젝트를 만듭니다(아직 안 했다면).
3. MongoDB URI를 찾습니다.

배포 개요 페이지로 이동하고 데이터베이스에 연결하여 이 작업을 수행할 수 있습니다.

그런 다음 사용 가능한 드라이버를 살펴봅니다.

그 중에서 URI가 나열되어 있는 것을 볼 수 있습니다.

그런 다음 로컬에서 환경 변수로 설정해 보겠습니다:

```shell
export MONGO_URI=...
```

4. OpenAI(LLM으로 사용할)에 대한 환경 변수도 설정해 보겠습니다:

```shell
export OPENAI_API_KEY=...
```

5. 이제 데이터를 인제스트해 보겠습니다! 이 디렉토리로 이동하고 `ingest.py`의 코드를 실행하면 됩니다. 예:

```shell
python ingest.py
```

이 코드를 원하는 데이터를 인제스트하도록 변경할 수 있습니다(그리고 그렇게 해야 합니다).

6. 이제 데이터에 대한 벡터 인덱스를 설정해야 합니다.

먼저 데이터베이스가 있는 클러스터에 연결할 수 있습니다.

그런 다음 모든 컬렉션이 나열된 곳으로 이동할 수 있습니다.

원하는 컬렉션을 찾고 해당 컬렉션의 검색 인덱스를 확인할 수 있습니다.

그것은 아마도 비어 있을 것이며, 새로 만들어야 합니다.

JSON 편집기를 사용하여 만들 수 있습니다.

그리고 다음 JSON을 붙여넣을 수 있습니다:

```text
 {
   "mappings": {
     "dynamic": true,
     "fields": {
       "embedding": {
         "dimensions": 1536,
         "similarity": "cosine",
         "type": "knnVector"
       }
     }
   }
 }
```

그 다음 "Next"를 누르고 "Create Search Index"를 누르세요. 약간의 시간이 걸리겠지만 데이터에 대한 인덱스가 생성될 것입니다!
