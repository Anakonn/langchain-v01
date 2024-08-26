---
sidebar_class_name: hidden
translated: true
---

# 도구 사용과 에이전트

LLM의 흥미로운 사용 사례 중 하나는 API, 함수, 데이터베이스 등 다른 "도구"에 대한 자연어 인터페이스를 구축하는 것입니다. LangChain은 다음과 같은 이유로 이러한 인터페이스를 구축하는 데 뛰어납니다:

- 모델 출력 파싱이 뛰어나 JSON, XML, OpenAI 함수 호출 등을 모델 출력에서 쉽게 추출할 수 있습니다.
- 많은 내장 [도구](/docs/integrations/tools) 컬렉션을 가지고 있습니다.
- 이러한 도구를 호출하는 방법에 있어 많은 유연성을 제공합니다.

도구를 사용하는 주요 방법은 두 가지가 있습니다: [체인](/docs/modules/chains)과 [에이전트](/docs/modules/agents)입니다.

체인은 사전에 정의된 도구 사용 순서를 생성할 수 있습니다.

![chain](../../../../../../static/img/tool_chain.svg)

에이전트는 모델이 도구를 여러 번 사용할 수 있도록 루프 내에서 도구를 사용하게 합니다.

![agent](../../../../../../static/img/tool_agent.svg)

두 접근 방식을 모두 시작하려면 [빠른 시작](/docs/use_cases/tool_use/quickstart) 페이지로 이동하세요.