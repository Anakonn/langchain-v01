---
translated: true
---

# 단계 후퇴 QA 프롬프팅

이 템플릿은 복잡한 질문에 대한 성능을 향상시키는 "단계 후퇴" 프롬프팅 기술을 복제합니다.

이 기술은 원래 질문과 단계 후퇴 질문에 대한 검색을 수행하여 일반적인 질문 답변 애플리케이션과 결합할 수 있습니다.

이에 대해 자세히 알아보려면 [여기](https://arxiv.org/abs/2310.06117)의 논문과 Cobus Greyling의 훌륭한 블로그 게시물 [여기](https://cobusgreyling.medium.com/a-new-prompt-engineering-technique-has-been-introduced-called-step-back-prompting-b00e8954cacb)를 참조하세요.

이 템플릿에서는 채팅 모델에 더 잘 작동하도록 프롬프트를 약간 수정했습니다.

## 환경 설정

OpenAI 모델에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정하세요.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이것만 설치하려면 다음을 수행할 수 있습니다:

```shell
langchain app new my-app --package stepback-qa-prompting
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add stepback-qa-prompting
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from stepback_qa_prompting.chain import chain as stepback_qa_prompting_chain

add_routes(app, stepback_qa_prompting_chain, path="/stepback-qa-prompting")
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

이렇게 하면 [http://localhost:8000](http://localhost:8000)에서 로컬로 실행되는 FastAPI 앱이 시작됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/stepback-qa-prompting/playground](http://127.0.0.1:8000/stepback-qa-prompting/playground)에서 playground에 액세스할 수 있습니다.

코드에서 다음과 같이 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/stepback-qa-prompting")
```
