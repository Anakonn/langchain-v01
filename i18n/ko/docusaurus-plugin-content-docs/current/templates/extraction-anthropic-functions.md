---
translated: true
---

# 추출-anthropic-함수

이 템플릿은 [Anthropic 함수 호출](https://python.langchain.com/docs/integrations/chat/anthropic_functions)을 가능하게 합니다.

이것은 추출 또는 태깅과 같은 다양한 작업에 사용될 수 있습니다.

함수 출력 스키마는 `chain.py`에서 설정할 수 있습니다.

## 환경 설정

Anthropic 모델에 액세스하려면 `ANTHROPIC_API_KEY` 환경 변수를 설정해야 합니다.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이것을 유일한 패키지로 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package extraction-anthropic-functions
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add extraction-anthropic-functions
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from extraction_anthropic_functions import chain as extraction_anthropic_functions_chain

add_routes(app, extraction_anthropic_functions_chain, path="/extraction-anthropic-functions")
```

(선택 사항) 이제 LangSmith를 구성해 보겠습니다.
LangSmith는 LangChain 애플리케이션을 추적, 모니터링 및 디버깅하는 데 도움이 될 것입니다.
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

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/extraction-anthropic-functions/playground](http://127.0.0.1:8000/extraction-anthropic-functions/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/extraction-anthropic-functions")
```

기본적으로 이 패키지는 `chain.py`에 지정된 정보에서 논문의 제목과 저자를 추출합니다. 이 템플릿은 기본적으로 `Claude2`를 사용합니다.

---
