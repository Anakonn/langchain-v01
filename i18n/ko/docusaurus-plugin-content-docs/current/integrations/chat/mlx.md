---
translated: true
---

# MLX

이 노트북은 `MLX` LLM을 채팅 모델로 사용하는 방법을 소개합니다.

특히, 우리는 다음을 수행할 것입니다:

1. [MLXPipeline](https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/llms/mlx_pipelines.py)을 활용합니다.
2. `ChatMLX` 클래스를 사용하여 이러한 LLM이 LangChain의 [Chat Messages](https://python.langchain.com/docs/modules/model_io/chat/#messages) 추상화와 상호 작용할 수 있도록 합니다.
3. 오픈 소스 LLM을 사용하여 `ChatAgent` 파이프라인을 구동하는 방법을 시연합니다.

```python
%pip install --upgrade --quiet  mlx-lm transformers huggingface_hub
```

## 1. LLM 인스턴스화

선택할 수 있는 세 가지 LLM 옵션이 있습니다.

```python
from langchain_community.llms.mlx_pipeline import MLXPipeline

llm = MLXPipeline.from_model_id(
    "mlx-community/quantized-gemma-2b-it",
    pipeline_kwargs={"max_tokens": 10, "temp": 0.1},
)
```

## 2. `ChatMLX` 인스턴스화하여 채팅 템플릿 적용

채팅 모델과 전달할 메시지를 인스턴스화합니다.

```python
from langchain.schema import (
    HumanMessage,
)
from langchain_community.chat_models.mlx import ChatMLX

messages = [
    HumanMessage(
        content="What happens when an unstoppable force meets an immovable object?"
    ),
]

chat_model = ChatMLX(llm=llm)
```

채팅 메시지가 LLM 호출을 위해 어떻게 형식화되는지 확인합니다.

```python
chat_model._to_chat_prompt(messages)
```

모델을 호출합니다.

```python
res = chat_model.invoke(messages)
print(res.content)
```

## 3. 에이전트로 사용해보세요!

여기서는 `gemma-2b-it`를 제로샷 `ReAct` 에이전트로 테스트해봅니다. 아래 예제는 [여기](https://python.langchain.com/docs/modules/agents/agent_types/react#using-chat-models)에서 가져왔습니다.

> 참고: 이 섹션을 실행하려면 [SerpAPI Token](https://serpapi.com/)을 환경 변수 `SERPAPI_API_KEY`로 저장해야 합니다.

```python
from langchain import hub
from langchain.agents import AgentExecutor, load_tools
from langchain.agents.format_scratchpad import format_log_to_str
from langchain.agents.output_parsers import (
    ReActJsonSingleInputOutputParser,
)
from langchain.tools.render import render_text_description
from langchain_community.utilities import SerpAPIWrapper
```

검색 엔진과 계산기에 접근할 수 있는 `react-json` 스타일 프롬프트로 에이전트를 구성합니다.

```python
# 도구 설정

tools = load_tools(["serpapi", "llm-math"], llm=llm)

# ReAct 스타일 프롬프트 설정

prompt = hub.pull("hwchase17/react-json")
prompt = prompt.partial(
    tools=render_text_description(tools),
    tool_names=", ".join([t.name for t in tools]),
)

# 에이전트 정의

chat_model_with_stop = chat_model.bind(stop=["\nObservation"])
agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_log_to_str(x["intermediate_steps"]),
    }
    | prompt
    | chat_model_with_stop
    | ReActJsonSingleInputOutputParser()
)

# AgentExecutor 인스턴스화

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.invoke(
    {
        "input": "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?"
    }
)
```