---
translated: true
---

# mongo-parent-document-retrieval

이 템플릿은 MongoDB와 OpenAI를 사용하여 RAG를 수행합니다.
이것은 Parent-Document Retrieval이라고 하는 더 발전된 형태의 검색입니다.

이 검색 방식에서는 먼저 큰 문서를 중간 크기의 청크로 분할합니다.
그런 다음 그 중간 크기의 청크를 작은 청크로 다시 분할합니다.
작은 청크에 대한 임베딩이 생성됩니다.
쿼리가 들어오면 해당 쿼리에 대한 임베딩이 생성되고 작은 청크와 비교됩니다.
그러나 작은 청크를 LLM에 직접 전달하는 대신 중간 크기의 청크가 전달됩니다.
이를 통해 더 세부적인 검색이 가능하지만 더 큰 컨텍스트(생성 중에 유용할 수 있음)도 전달할 수 있습니다.

## 환경 설정

MongoDB URI와 OpenAI API KEY라는 두 개의 환경 변수를 내보내야 합니다.
MongoDB URI가 없는 경우 아래의 `MongoDB 설정` 섹션을 참조하여 설정하는 방법을 확인하세요.

```shell
export MONGO_URI=...
export OPENAI_API_KEY=...
```

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package mongo-parent-document-retrieval
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add mongo-parent-document-retrieval
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from mongo_parent_document_retrieval import chain as mongo_parent_document_retrieval_chain

add_routes(app, mongo_parent_document_retrieval_chain, path="/mongo-parent-document-retrieval")
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

이미 연결하고 싶은 Mongo Search Index가 없는 경우 아래 `MongoDB 설정` 섹션을 먼저 참조하세요.
Parent Document Retrieval은 다른 인덱싱 전략을 사용하므로 이 새로운 설정을 실행하는 것이 좋습니다.

기존 MongoDB Search 인덱스에 연결하려면 `mongo_parent_document_retrieval/chain.py`에서 연결 세부 정보를 편집하세요.

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 시작할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 볼 수 있습니다.
[http://127.0.0.1:8000/mongo-parent-document-retrieval/playground](http://127.0.0.1:8000/mongo-parent-document-retrieval/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스하려면 다음과 같이 하면 됩니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/mongo-parent-document-retrieval")
```

추가 정보는 [이 노트북](https://colab.research.google.com/drive/1cr2HBAHyBmwKUerJq2if0JaNhy-hIq7I#scrollTo=TZp7_CBfxTOB)을 참조하세요.

## MongoDB 설정

MongoDB 계정을 설정하고 데이터를 수집해야 하는 경우 이 단계를 사용하세요.
먼저 [여기](https://www.mongodb.com/docs/atlas/getting-started/)의 표준 MongoDB Atlas 설정 지침을 따르겠습니다.

1. 계정을 만듭니다(아직 안 했다면).
2. 새 프로젝트를 만듭니다(아직 안 했다면).
3. MongoDB URI를 찾습니다.

배포 개요 페이지로 이동하고 데이터베이스에 연결하여 이 작업을 수행할 수 있습니다.

사용 가능한 드라이버를 살펴보면

URI가 나열되어 있는 것을 볼 수 있습니다.

이제 로컬에 해당 환경 변수를 설정해 보겠습니다:

```shell
export MONGO_URI=...
```

4. OpenAI에 대한 환경 변수도 설정해 보겠습니다(LLM으로 사용할 것입니다).

```shell
export OPENAI_API_KEY=...
```

5. 이제 데이터를 수집해 보겠습니다! 이 디렉토리로 이동하고 `ingest.py`의 코드를 실행하면 됩니다. 예:

```shell
python ingest.py
```

이 코드를 원하는 데이터로 변경할 수(그리고 변경해야) 있습니다.

6. 이제 데이터에 대한 벡터 인덱스를 설정해야 합니다.

먼저 데이터베이스가 있는 클러스터에 연결할 수 있습니다.

그런 다음 모든 컬렉션이 나열된 곳으로 이동할 수 있습니다.

원하는 컬렉션을 찾고 해당 컬렉션의 검색 인덱스를 확인할 수 있습니다.

이 인덱스는 아마도 비어 있을 것이며 새로 만들어야 합니다.

JSON 편집기를 사용하여 새 인덱스를 만들 수 있습니다.

그리고 다음 JSON을 붙여넣을 수 있습니다:

```text
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "doc_level": [
        {
          "type": "token"
        }
      ],
      "embedding": {
        "dimensions": 1536,
        "similarity": "cosine",
        "type": "knnVector"
      }
    }
  }
}
```

그런 다음 "Next"를 클릭하고 "Create Search Index"를 클릭하세요. 약간의 시간이 지나면 데이터에 대한 인덱스가 생성됩니다!
