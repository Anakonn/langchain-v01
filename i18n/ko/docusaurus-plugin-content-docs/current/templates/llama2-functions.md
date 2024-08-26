---
translated: true
---

# llama2-functions

이 템플릿은 [LLaMA2 모델이 지원하는 지정된 JSON 출력 스키마](https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md)를 사용하여 구조화되지 않은 데이터에서 구조화된 데이터를 추출합니다.

추출 스키마는 `chain.py`에서 설정할 수 있습니다.

## 환경 설정

이 작업에는 [Replicate에서 호스팅하는 LLaMA2-13b 모델](https://replicate.com/andreasjansson/llama-2-13b-chat-gguf/versions)이 사용됩니다.

`REPLICATE_API_TOKEN`이 환경에 설정되어 있는지 확인하십시오.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package llama2-functions
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add llama2-functions
```

그리고 `server.py` 파일에 다음 코드를 추가하십시오:

```python
from llama2_functions import chain as llama2_functions_chain

add_routes(app, llama2_functions_chain, path="/llama2-functions")
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

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/llama2-functions/playground](http://127.0.0.1:8000/llama2-functions/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/llama2-functions")
```
