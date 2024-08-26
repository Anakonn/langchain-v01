---
translated: true
---

# 채팅봇 피드백 템플릿

이 템플릿은 명시적인 사용자 피드백 없이도 채팅봇을 평가하는 방법을 보여줍니다. [chain.py](https://github.com/langchain-ai/langchain/blob/master/templates/chat-bot-feedback/chat_bot_feedback/chain.py)에 정의된 간단한 채팅봇과 사용자 응답에 따라 봇 응답의 효과성을 점수화하는 사용자 정의 평가기를 정의합니다. 이 평가기를 채팅봇에 적용하여 실행할 수 있으며, 이 템플릿을 사용하여 채팅 앱을 직접 배포할 수도 있습니다.

[채팅봇](https://python.langchain.com/docs/use_cases/chatbots)은 LLM을 배포하는 가장 일반적인 인터페이스 중 하나입니다. 채팅봇의 품질은 다양하므로 지속적인 개발이 중요합니다. 그러나 사용자들은 엄지 손가락 버튼과 같은 명시적인 피드백 메커니즘을 제공하지 않는 경향이 있습니다. 또한 "세션 길이" 또는 "대화 길이"와 같은 전통적인 분석에는 명확성이 부족합니다. 그러나 채팅봇과의 다중 턴 대화에는 많은 정보가 포함되어 있으며, 이를 세부 조정, 평가 및 제품 분석을 위한 지표로 변환할 수 있습니다.

[Chat Langchain](https://chat.langchain.com/)을 사례 연구로 살펴보면, 모든 쿼리 중 약 0.04%만 명시적인 피드백을 받습니다. 그러나 약 70%의 쿼리가 이전 질문에 대한 후속 질문입니다. 이러한 후속 쿼리의 상당 부분은 이전 AI 응답의 품질을 유추할 수 있는 유용한 정보를 제공합니다.

이 템플릿은 이러한 "피드백 부족" 문제를 해결합니다. 아래는 이 채팅봇의 예시 호출입니다:

[](https://smith.langchain.com/public/3378daea-133c-4fe8-b4da-0a3044c5dbe8/r?runtab=1)

사용자가 이 응답([링크](https://smith.langchain.com/public/a7e2df54-4194-455d-9978-cecd8be0df1e/r))에 응답하면 응답 평가기가 호출되어 다음과 같은 평가 결과가 생성됩니다:

[](https://smith.langchain.com/public/534184ee-db8f-4831-a386-3f578145114c/r)

이와 같이 평가기는 사용자가 점점 더 좌절감을 느끼고 있음을 확인하여, 이전 응답이 효과적이지 않았음을 나타냅니다.

## LangSmith 피드백

[LangSmith](https://smith.langchain.com/)는 프로덕션 수준의 LLM 애플리케이션을 구축하는 플랫폼입니다. 디버깅 및 오프라인 평가 기능 외에도 LangSmith는 사용자 및 모델 지원 피드백을 캡처하여 LLM 애플리케이션을 지속적으로 개선할 수 있습니다. 이 템플릿은 LLM을 사용하여 애플리케이션에 대한 피드백을 생성하며, 이를 사용하여 서비스를 지속적으로 개선할 수 있습니다. LangSmith를 사용한 피드백 수집에 대한 더 많은 예는 [문서](https://docs.smith.langchain.com/cookbook/feedback-examples)를 참조하세요.

## 평가기 구현

사용자 피드백은 사용자 정의 `RunEvaluator`에 의해 유추됩니다. 이 평가기는 `EvaluatorCallbackHandler`를 사용하여 호출되며, 채팅봇의 런타임에 간섭하지 않도록 별도의 스레드에서 실행됩니다. 이 사용자 정의 평가기를 호환되는 모든 채팅봇에 적용할 수 있습니다:

```python
my_chain.with_config(
    callbacks=[
        EvaluatorCallbackHandler(
            evaluators=[
                ResponseEffectivenessEvaluator(evaluate_response_effectiveness)
            ]
        )
    ],
)
```

평가기는 `gpt-3.5-turbo` LLM을 사용하여 사용자의 후속 응답을 기반으로 AI의 가장 최근 채팅 메시지를 평가합니다. 점수와 함께 이유를 생성하며, 이는 LangSmith의 피드백으로 변환되어 `last_run_id`로 제공된 값에 적용됩니다.

LLM 내에서 사용되는 프롬프트는 [허브에서 확인할 수 있습니다](https://smith.langchain.com/hub/wfh/response-effectiveness). 앱의 목적 또는 앱이 응답해야 하는 질문 유형과 같은 추가 앱 컨텍스트나 LLM이 집중해야 할 "증상"을 사용자 정의할 수 있습니다. 이 평가기는 또한 OpenAI의 함수 호출 API를 활용하여 더 일관되고 구조화된 출력을 보장합니다.

## 환경 변수

OpenAI 모델을 사용하려면 `OPENAI_API_KEY`를 설정해야 합니다. 또한 `LANGSMITH_API_KEY`를 설정하여 LangSmith를 구성하세요.

```bash
export OPENAI_API_KEY=sk-...
export LANGSMITH_API_KEY=...
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_PROJECT=my-project # Set to the project you want to save to
```

## 사용법

`LangServe`를 통해 배포하는 경우 서버가 콜백 이벤트를 반환하도록 구성하는 것이 좋습니다. 이렇게 하면 `RemoteRunnable`을 사용하여 생성하는 추적에 백엔드 추적이 포함됩니다.

```python
from chat_bot_feedback.chain import chain

add_routes(app, chain, path="/chat-bot-feedback", include_callback_events=True)
```

서버가 실행되면 다음 코드 조각을 사용하여 2턴 대화에 대한 채팅봇 응답을 스트리밍할 수 있습니다.

```python
<!--IMPORTS:[{"imported": "tracing_v2_enabled", "source": "langchain.callbacks.manager", "docs": "https://api.python.langchain.com/en/latest/tracers/langchain_core.tracers.context.tracing_v2_enabled.html", "title": "Chat Bot Feedback Template"}, {"imported": "BaseMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.base.BaseMessage.html", "title": "Chat Bot Feedback Template"}, {"imported": "AIMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessage.html", "title": "Chat Bot Feedback Template"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "Chat Bot Feedback Template"}]-->
from functools import partial
from typing import Dict, Optional, Callable, List
from langserve import RemoteRunnable
from langchain.callbacks.manager import tracing_v2_enabled
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage

# Update with the URL provided by your LangServe server
chain = RemoteRunnable("http://127.0.0.1:8031/chat-bot-feedback")

def stream_content(
    text: str,
    chat_history: Optional[List[BaseMessage]] = None,
    last_run_id: Optional[str] = None,
    on_chunk: Callable = None,
):
    results = []
    with tracing_v2_enabled() as cb:
        for chunk in chain.stream(
            {"text": text, "chat_history": chat_history, "last_run_id": last_run_id},
        ):
            on_chunk(chunk)
            results.append(chunk)
        last_run_id = cb.latest_run.id if cb.latest_run else None
    return last_run_id, "".join(results)

chat_history = []
text = "Where are my keys?"
last_run_id, response_message = stream_content(text, on_chunk=partial(print, end=""))
print()
chat_history.extend([HumanMessage(content=text), AIMessage(content=response_message)])
text = "I CAN'T FIND THEM ANYWHERE"  # The previous response will likely receive a low score,
# as the user's frustration appears to be escalating.
last_run_id, response_message = stream_content(
    text,
    chat_history=chat_history,
    last_run_id=str(last_run_id),
    on_chunk=partial(print, end=""),
)
print()
chat_history.extend([HumanMessage(content=text), AIMessage(content=response_message)])
```

이는 `tracing_v2_enabled` 콜백 관리자를 사용하여 호출의 실행 ID를 가져오며, 이를 동일한 채팅 스레드의 후속 호출에 제공하여 평가기가 적절한 추적에 피드백을 할당할 수 있습니다.

## 결론

이 템플릿은 LangServe를 사용하여 직접 배포할 수 있는 간단한 채팅봇 정의를 제공합니다. 명시적인 사용자 평가 없이도 봇에 대한 평가 피드백을 기록하는 사용자 정의 평가기를 정의합니다. 이는 분석을 보완하고 세부 조정 및 평가를 위한 데이터 포인트를 더 잘 선택할 수 있는 효과적인 방법입니다.
