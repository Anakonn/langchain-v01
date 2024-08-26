---
translated: true
---

# 플레이트 체인

이 템플릿은 실험실 플레이트에서 데이터를 구문 분석할 수 있게 합니다.

생화학 또는 분자 생물학의 맥락에서 실험실 플레이트는 격자 형식으로 샘플을 보관하는 일반적으로 사용되는 도구입니다.

이를 통해 표준화된(예: JSON) 형식으로 결과 데이터를 처리할 수 있습니다.

## 환경 설정

OpenAI 모델에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정하세요.

## 사용법

plate-chain을 사용하려면 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새로운 LangChain 프로젝트를 만들고 plate-chain을 유일한 패키지로 설치하는 방법은 다음과 같습니다:

```shell
langchain app new my-app --package plate-chain
```

기존 프로젝트에 추가하려면 다음을 실행하세요:

```shell
langchain app add plate-chain
```

그런 다음 `server.py` 파일에 다음 코드를 추가하세요:

```python
from plate_chain import chain as plate_chain

add_routes(app, plate_chain, path="/plate-chain")
```

(선택 사항) LangSmith를 구성하여 LangChain 애플리케이션을 추적, 모니터링 및 디버깅하려면 다음 코드를 사용하세요:

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

이 디렉토리에 있다면 다음과 같이 LangServe 인스턴스를 직접 시작할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 [http://localhost:8000](http://localhost:8000)에서 로컬로 실행되는 FastAPI 앱이 시작됩니다.

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 볼 수 있습니다.
[http://127.0.0.1:8000/plate-chain/playground](http://127.0.0.1:8000/plate-chain/playground)에서 playground에 액세스할 수 있습니다.

코드에서 다음과 같이 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/plate-chain")
```
