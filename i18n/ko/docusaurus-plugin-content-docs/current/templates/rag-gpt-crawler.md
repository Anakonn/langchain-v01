---
translated: true
---

# rag-gpt-crawler

GPT-crawler는 사용자 지정 GPT 또는 기타 앱(RAG)에 사용할 파일을 생성하기 위해 웹사이트를 크롤링합니다.

이 템플릿은 [gpt-crawler](https://github.com/BuilderIO/gpt-crawler)를 사용하여 RAG 앱을 구축합니다.

## 환경 설정

OpenAI 모델에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정하십시오.

## 크롤링

GPT-crawler를 실행하여 gpt-crawler 리포지토리의 구성 파일을 사용하여 일련의 URL에서 콘텐츠를 추출합니다.

LangChain 사용 사례 문서에 대한 예제 구성은 다음과 같습니다:

```javascript
export const config: Config = {
  url: "https://python.langchain.com/docs/use_cases/",
  match: "https://python.langchain.com/docs/use_cases/**",
  selector: ".docMainContainer_gTbr",
  maxPagesToCrawl: 10,
  outputFileName: "output.json",
};
```

그런 다음 [gpt-crawler](https://github.com/BuilderIO/gpt-crawler) README에 설명된 대로 이를 실행합니다:

```shell
npm start
```

그리고 `output.json` 파일을 이 README가 포함된 폴더로 복사합니다.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이것만 설치하려면 다음을 수행할 수 있습니다:

```shell
langchain app new my-app --package rag-gpt-crawler
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add rag-gpt-crawler
```

그리고 `server.py` 파일에 다음 코드를 추가하십시오:

```python
from rag_chroma import chain as rag_gpt_crawler

add_routes(app, rag_gpt_crawler, path="/rag-gpt-crawler")
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

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 시작할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다
[http://localhost:8000](http://localhost:8000)

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 볼 수 있습니다
플레이그라운드는 [http://127.0.0.1:8000/rag-gpt-crawler/playground](http://127.0.0.1:8000/rag-gpt-crawler/playground)에서 액세스할 수 있습니다

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-gpt-crawler")
```
