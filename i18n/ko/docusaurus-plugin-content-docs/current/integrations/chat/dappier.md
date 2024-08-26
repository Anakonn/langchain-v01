---
translated: true
---

# Dappier AI

**Dappier: 동적인 실시간 데이터 모델로 AI를 강화하다**

Dappier는 개발자에게 뉴스, 엔터테인먼트, 금융, 시장 데이터, 날씨 등 다양한 실시간 데이터 모델에 즉시 접근할 수 있는 최첨단 플랫폼을 제공합니다. 우리의 사전 학습된 데이터 모델을 통해 AI 애플리케이션의 정확하고 최신의 응답을 보장하고 부정확성을 최소화할 수 있습니다.

Dappier 데이터 모델은 세계 최고의 브랜드에서 제공하는 신뢰할 수 있는 최신 콘텐츠를 통해 차세대 LLM 애플리케이션을 구축하는 데 도움을 줍니다. 창의력을 발휘하고 간단한 API를 통해 실행 가능한 독점 데이터를 활용하여 GPT 앱이나 AI 워크플로우를 향상시키십시오. 신뢰할 수 있는 출처의 독점 데이터를 통해 AI를 강화하는 것은 질문에 상관없이 사실적이고 최신의 응답을 보장하고 헛된 응답을 줄이는 최고의 방법입니다.

개발자를 위한, 개발자에 의해
개발자를 염두에 두고 설계된 Dappier는 데이터 통합에서 수익화에 이르는 과정을 단순화하여 AI 모델을 배포하고 수익을 올릴 수 있는 명확하고 간단한 경로를 제공합니다. **https://dappier.com/**에서 새로운 인터넷의 미래 수익화 인프라를 경험해 보세요.

이 예제는 LangChain을 사용하여 Dappier AI 모델과 상호 작용하는 방법을 설명합니다.

---

Dappier AI 데이터 모델을 사용하려면 API 키가 필요합니다. Dappier 플랫폼(https://platform.dappier.com/)에 로그인하여 프로필에서 API 키를 생성하십시오.

API 참고 자료에 대한 자세한 내용은 https://docs.dappier.com/introduction에서 확인할 수 있습니다.

Dappier Chat Model을 사용하려면 클래스를 초기화할 때 매개변수 dappier_api_key를 통해 키를 직접 전달하거나 환경 변수로 설정할 수 있습니다.

```bash
export DAPPIER_API_KEY="..."
```

```python
from langchain_community.chat_models.dappier import ChatDappierAI
from langchain_core.messages import HumanMessage
```

```python
chat = ChatDappierAI(
    dappier_endpoint="https://api.dappier.com/app/datamodelconversation",
    dappier_model="dm_01hpsxyfm2fwdt2zet9cg6fdxt",
    dappier_api_key="...",
)
```

```python
messages = [HumanMessage(content="2024년 슈퍼볼 우승 팀은?")]
chat.invoke(messages)
```

```output
AIMessage(content='안녕하세요! 캔자스 시티 치프스가 2024년 슈퍼볼 LVIII에서 우승했습니다. 그들은 연장전에서 샌프란시스코 49ers를 25-22로 이겼습니다. 정말 멋진 경기였어요! 🏈')
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='2024년 슈퍼볼 LVIII에서 캔자스 시티 치프스가 우승했습니다! 🏈')
```