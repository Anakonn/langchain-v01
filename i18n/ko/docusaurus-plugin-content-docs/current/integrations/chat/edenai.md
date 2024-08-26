---
translated: true
---

# Eden AI

Eden AI는 최고의 AI 제공업체를 하나로 통합하여 사용자가 인공지능의 진정한 잠재력을 활용할 수 있도록 돕고 있습니다. 올인원 종합 플랫폼으로, 사용자는 단일 API를 통해 AI 기능을 빠르게 배포하고 전체 AI 기능에 손쉽게 접근할 수 있습니다. (웹사이트: https://edenai.co/)

이 예제는 LangChain을 사용하여 Eden AI 모델과 상호 작용하는 방법을 설명합니다.

---

`EdenAI`는 단순한 모델 호출을 넘어 다음과 같은 고급 기능을 제공합니다:

- **다양한 제공업체**: 여러 제공업체에서 제공하는 다양한 언어 모델에 접근할 수 있어, 사용 사례에 가장 적합한 모델을 선택할 수 있습니다.
- **백업 메커니즘**: 기본 제공업체가 사용할 수 없는 경우 원활한 운영을 보장하기 위해 대체 제공업체로 쉽게 전환할 수 있는 백업 메커니즘을 설정할 수 있습니다.
- **사용량 추적**: 프로젝트별 및 API 키별로 사용 통계를 추적할 수 있습니다. 이 기능을 통해 리소스 소비를 효과적으로 모니터링하고 관리할 수 있습니다.
- **모니터링 및 가시성**: `EdenAI`는 플랫폼에서 종합적인 모니터링 및 가시성 도구를 제공합니다. 언어 모델의 성능을 모니터링하고, 사용 패턴을 분석하며, 애플리케이션을 최적화할 수 있는 유용한 인사이트를 얻을 수 있습니다.

EDENAI의 API에 접근하려면 API 키가 필요합니다.

계정을 생성하고 (https://app.edenai.run/user/register) 여기에서 (https://app.edenai.run/admin/iam/api-keys) API 키를 받으십시오.

키를 받은 후에는 다음 명령어를 실행하여 환경 변수로 설정합니다:

```bash
export EDENAI_API_KEY="..."
```

API 참고 자료에 대한 자세한 내용은 https://docs.edenai.co/reference에서 확인할 수 있습니다.

환경 변수를 설정하지 않으려면 EdenAI Chat Model 클래스를 초기화할 때 edenai_api_key 매개변수를 통해 키를 직접 전달할 수 있습니다.

```python
from langchain_community.chat_models.edenai import ChatEdenAI
from langchain_core.messages import HumanMessage
```

```python
chat = ChatEdenAI(
    edenai_api_key="...", provider="openai", temperature=0.2, max_tokens=250
)
```

```python
messages = [HumanMessage(content="Hello !")]
chat.invoke(messages)
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

## 스트리밍 및 배칭

`ChatEdenAI`는 스트리밍 및 배칭을 지원합니다. 아래는 예제입니다.

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
Hello! How can I assist you today?
```

```python
chat.batch([messages])
```

```output
[AIMessage(content='Hello! How can I assist you today?')]
```

## 백업 메커니즘

Eden AI를 사용하면 기본 제공업체가 사용할 수 없는 경우 원활한 운영을 보장하기 위해 대체 제공업체로 쉽게 전환할 수 있는 백업 메커니즘을 설정할 수 있습니다.

```python
chat = ChatEdenAI(
    edenai_api_key="...",
    provider="openai",
    temperature=0.2,
    max_tokens=250,
    fallback_providers="google",
)
```

이 예제에서는 OpenAI에 문제가 발생하면 Google을 백업 제공업체로 사용할 수 있습니다.

Eden AI에 대한 더 많은 정보와 자세한 내용은 이 링크에서 확인하십시오: https://docs.edenai.co/docs/additional-parameters

## 호출 연결

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template(
    "What is a good name for a company that makes {product}?"
)
chain = prompt | chat
```

```python
chain.invoke({"product": "healthy snacks"})
```

```output
AIMessage(content='VitalBites')
```