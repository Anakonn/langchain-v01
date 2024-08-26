---
translated: true
---

# cohere-librarian

이 템플릿은 Cohere를 사서관으로 만듭니다.

벡터 데이터베이스와 Cohere 임베딩, 도서관에 대한 정보가 포함된 프롬프트를 가진 채팅봇, 그리고 인터넷에 접근할 수 있는 RAG 채팅봇 등 다양한 기능을 처리할 수 있는 라우터를 사용하는 것을 보여줍니다.

도서 추천 기능을 더 잘 보여주려면 books_with_blurbs.csv 파일을 다음 데이터셋에서 더 큰 샘플로 교체하는 것을 고려해 보세요: https://www.kaggle.com/datasets/jdobrow/57000-books-with-metadata-and-blurbs/

## 환경 설정

Cohere 모델에 액세스하려면 `COHERE_API_KEY` 환경 변수를 설정해야 합니다.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package cohere-librarian
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add cohere-librarian
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from cohere_librarian.chain import chain as cohere_librarian_chain

add_routes(app, cohere_librarian_chain, path="/cohere-librarian")
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

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 실행할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 FastAPI 앱이 시작되며 [http://localhost:8000](http://localhost:8000)에서 로컬 서버가 실행됩니다.

[http://localhost:8000/docs](http://localhost:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://localhost:8000/cohere-librarian/playground](http://localhost:8000/cohere-librarian/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/cohere-librarian")
```
