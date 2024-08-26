---
translated: true
---

# rag-timescale-conversation

이 템플릿은 [conversational](https://python.langchain.com/docs/expression_language/cookbook/retrieval#conversational-retrieval-chain) [retrieval](https://python.langchain.com/docs/use_cases/question_answering/)에 사용됩니다.

대화 기록과 검색된 문서를 LLM에 전달하여 합성합니다.

## 환경 설정

이 템플릿은 Timescale Vector를 벡터 저장소로 사용하며 `TIMESCALES_SERVICE_URL`이 필요합니다. 아직 계정이 없다면 [여기](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)에서 90일 무료 체험에 가입하세요.

샘플 데이터셋을 로드하려면 `LOAD_SAMPLE_DATA=1`로 설정하세요. 자신의 데이터셋을 로드하려면 아래 섹션을 참고하세요.

OpenAI 모델에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정하세요.

## 사용법

이 패키지를 사용하려면 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U "langchain-cli[serve]"
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 하세요:

```shell
langchain app new my-app --package rag-timescale-conversation
```

기존 프로젝트에 추가하려면 다음과 같이 실행하세요:

```shell
langchain app add rag-timescale-conversation
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_timescale_conversation import chain as rag_timescale_conversation_chain

add_routes(app, rag_timescale_conversation_chain, path="/rag-timescale_conversation")
```

(선택 사항) LangSmith를 구성해 보겠습니다.
LangSmith는 LangChain 애플리케이션을 추적, 모니터링 및 디버깅하는 데 도움이 됩니다.
[여기](https://smith.langchain.com/)에서 LangSmith에 가입할 수 있습니다.
액세스 권한이 없다면 이 섹션을 건너뛸 수 있습니다.

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

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/rag-timescale-conversation/playground](http://127.0.0.1:8000/rag-timescale-conversation/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스하려면 다음과 같이 하세요:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-timescale-conversation")
```

예제 사용법은 `rag_conversation.ipynb` 노트북을 참고하세요.

## 자신의 데이터셋 로드하기

자신의 데이터셋을 로드하려면 `load_dataset` 함수를 만들어야 합니다. `load_ts_git_dataset` 함수의 예제를 `load_sample_dataset.py` 파일에서 확인할 수 있습니다. 이 함수를 독립 실행 함수(예: 배시 스크립트)로 실행하거나 chain.py에 추가할 수 있습니다(그러나 한 번만 실행해야 합니다).
