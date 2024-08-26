---
translated: true
---

# Comet Tracing

LangChains 실행을 Comet으로 추적하는 두 가지 방법이 있습니다:

1. `LANGCHAIN_COMET_TRACING` 환경 변수를 "true"로 설정하는 방법. 이것이 권장되는 방법입니다.
2. `CometTracer`를 수동으로 임포트하고 명시적으로 전달하는 방법.

```python
import os

import comet_llm

os.environ["LANGCHAIN_COMET_TRACING"] = "true"

# API 키가 설정되지 않은 경우 Comet에 연결

comet_llm.init()

# 환경 변수를 사용하여 Comet을 구성하는 방법에 대한 문서

# https://www.comet.com/docs/v2/api-and-sdk/llm-sdk/configuration/

# 여기서 Comet 프로젝트를 구성합니다

os.environ["COMET_PROJECT_NAME"] = "comet-example-langchain-tracing"

from langchain.agents import AgentType, initialize_agent, load_tools
from langchain.llms import OpenAI
```

```python
# 추적을 위한 에이전트 실행. 이 예제를 실행하려면 OPENAI_API_KEY가 적절히 설정되어 있어야 합니다.

llm = OpenAI(temperature=0)
tools = load_tools(["llm-math"], llm=llm)
```

```python
agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

agent.run("What is 2 raised to .123243 power?")  # 이것이 추적되어야 합니다
# 체인에 대한 URL이 콘솔에 출력되어야 합니다:

# https://www.comet.com/<workspace>/<project_name>

# 이 URL을 사용하여 Comet에서 LLM 체인을 볼 수 있습니다.

```

```python
# 이제 환경 변수를 해제하고 컨텍스트 관리자를 사용합니다.

if "LANGCHAIN_COMET_TRACING" in os.environ:
    del os.environ["LANGCHAIN_COMET_TRACING"]

from langchain_community.callbacks.tracers.comet import CometTracer

tracer = CometTracer()

# 콜백을 각 LLM, 도구 및 에이전트에 전달하여 LLM, 도구 및 에이전트를 다시 생성합니다.

llm = OpenAI(temperature=0)
tools = load_tools(["llm-math"], llm=llm)
agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

agent.run(
    "What is 2 raised to .123243 power?", callbacks=[tracer]
)  # 이것이 추적되어야 합니다
```