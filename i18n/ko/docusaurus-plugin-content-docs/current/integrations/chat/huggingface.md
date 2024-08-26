---
translated: true
---

# hugging Face

이 노트북에서는 `Hugging Face` LLM을 채팅 모델로 사용하는 방법을 소개합니다.

특히, 우리는 다음을 수행할 것입니다:

1. [HuggingFaceTextGenInference](https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/llms/huggingface_text_gen_inference.py), [HuggingFaceEndpoint](https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/llms/huggingface_endpoint.py) 또는 [HuggingFaceHub](https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/llms/huggingface_hub.py) 통합을 활용하여 `LLM`을 인스턴스화합니다.
2. `ChatHuggingFace` 클래스를 사용하여 이러한 LLM이 LangChain의 [Chat Messages](/docs/modules/model_io/chat/#messages) 추상화와 상호 작용할 수 있도록 합니다.
3. 오픈 소스 LLM을 사용하여 `ChatAgent` 파이프라인을 구동하는 방법을 시연합니다.

> 참고: 시작하려면 [Hugging Face 액세스 토큰](https://huggingface.co/docs/hub/security-tokens)을 환경 변수 `HUGGINGFACEHUB_API_TOKEN`로 저장해야 합니다.

```python
%pip install --upgrade --quiet  text-generation transformers google-search-results numexpr langchainhub sentencepiece jinja2
```

```output
[0m참고: 업데이트된 패키지를 사용하려면 커널을 재시작해야 할 수 있습니다.
```

## 1. LLM 인스턴스화

선택할 수 있는 세 가지 LLM 옵션이 있습니다.

### `HuggingFaceTextGenInference`

```python
import os

from langchain_community.llms import HuggingFaceTextGenInference

ENDPOINT_URL = "<YOUR_ENDPOINT_URL_HERE>"
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

llm = HuggingFaceTextGenInference(
    inference_server_url=ENDPOINT_URL,
    max_new_tokens=512,
    top_k=50,
    temperature=0.1,
    repetition_penalty=1.03,
    server_kwargs={
        "headers": {
            "Authorization": f"Bearer {HF_TOKEN}",
            "Content-Type": "application/json",
        }
    },
)
```

### `HuggingFaceEndpoint`

```python
from langchain_community.llms import HuggingFaceEndpoint

ENDPOINT_URL = "<YOUR_ENDPOINT_URL_HERE>"
llm = HuggingFaceEndpoint(
    endpoint_url=ENDPOINT_URL,
    task="text-generation",
    model_kwargs={
        "max_new_tokens": 512,
        "top_k": 50,
        "temperature": 0.1,
        "repetition_penalty": 1.03,
    },
)
```

### `HuggingFaceHub`

```python
from langchain_community.llms import HuggingFaceHub

llm = HuggingFaceHub(
    repo_id="HuggingFaceH4/zephyr-7b-beta",
    task="text-generation",
    model_kwargs={
        "max_new_tokens": 512,
        "top_k": 30,
        "temperature": 0.1,
        "repetition_penalty": 1.03,
    },
)
```

```output
/Users/jacoblee/langchain/langchain/libs/langchain/.venv/lib/python3.10/site-packages/huggingface_hub/utils/_deprecation.py:127: FutureWarning: '__init__' (from 'huggingface_hub.inference_api') is deprecated and will be removed from version '1.0'. `InferenceApi` client is deprecated in favor of the more feature-complete `InferenceClient`. Check out this guide to learn how to convert your script to use it: https://huggingface.co/docs/huggingface_hub/guides/inference#legacy-inferenceapi-client.
  warnings.warn(warning_message, FutureWarning)
```

## 2. 채팅 템플릿을 적용하기 위해 `ChatHuggingFace` 인스턴스화

채팅 모델과 전달할 메시지를 인스턴스화합니다.

```python
from langchain.schema import (
    HumanMessage,
    SystemMessage,
)
from langchain_community.chat_models.huggingface import ChatHuggingFace

messages = [
    SystemMessage(content="You're a helpful assistant"),
    HumanMessage(
        content="What happens when an unstoppable force meets an immovable object?"
    ),
]

chat_model = ChatHuggingFace(llm=llm)
```

```output
WARNING! repo_id is not default parameter.
                    repo_id was transferred to model_kwargs.
                    Please confirm that repo_id is what you intended.
WARNING! task is not default parameter.
                    task was transferred to model_kwargs.
                    Please confirm that task is what you intended.
WARNING! huggingfacehub_api_token is not default parameter.
                    huggingfacehub_api_token was transferred to model_kwargs.
                    Please confirm that huggingfacehub_api_token is what you intended.
None of PyTorch, TensorFlow >= 2.0, or Flax have been found. Models won't be available and only tokenizers, configuration and file/data utilities can be used.
```

어떤 모델과 해당 채팅 템플릿이 사용되고 있는지 확인합니다.

```python
chat_model.model_id
```

```output
'HuggingFaceH4/zephyr-7b-beta'
```

LLM 호출을 위해 채팅 메시지가 어떻게 형식화되는지 확인합니다.

```python
chat_model._to_chat_prompt(messages)
```

```output
"\nYou're a helpful assistant</s>\n\nWhat happens when an unstoppable force meets an immovable object?</s>\n\n"
```

모델을 호출합니다.

```python
res = chat_model.invoke(messages)
print(res.content)
```

```output
According to a popular philosophical paradox, when an unstoppable force meets an immovable object, it is impossible to determine which one will prevail because both are defined as being completely unyielding and unmovable. The paradox suggests that the very concepts of "unstoppable force" and "immovable object" are inherently contradictory, and therefore, it is illogical to imagine a scenario where they would meet and interact. However, in practical terms, it is highly unlikely for such a scenario to occur in the real world, as the concepts of "unstoppable force" and "immovable object" are often used metaphorically to describe hypothetical situations or abstract concepts, rather than physical objects or forces.
```

## 3. 에이전트로 사용해보세요!

여기서는 `Zephyr-7B-beta`를 제로샷 `ReAct` 에이전트로 테스트해봅니다. 아래 예제는 [여기](/docs/modules/agents/agent_types/react#using-chat-models)에서 가져왔습니다.

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

```output

[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mQuestion: Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?

Thought: I need to use the Search tool to find out who Leo DiCaprio's current girlfriend is. Then, I can use the Calculator tool to raise her current age to the power of 0.43.

Action:
```

{
"action": "Search",
"action_input": "leo dicaprio girlfriend"
}

```
[0m[36;1m[1;3mLeonardo DiCaprio may have found The One in Vittoria Ceretti. “They are in love,” a source exclusively reveals in the latest issue of Us Weekly. “Leo was clearly very proud to be showing Vittoria off and letting everyone see how happy they are together.”[0m[32;1m[1;3mNow that we know Leo DiCaprio's current girlfriend is Vittoria Ceretti, let's find out her current age.

Action:
```

{
"action": "Search",
"action_input": "vittoria ceretti age"
}

```
[0m[36;1m[1;3m25 years[0m[32;1m[1;3mNow that we know Vittoria Ceretti's current age is 25, let's use the Calculator tool to raise it to the power of 0.43.

Action:
```

{
"action": "Calculator",
"action_input": "25^0.43"
}

```
[0m[33;1m[1;3mAnswer: 3.991298452658078[0m[32;1m[1;3mFinal Answer: Vittoria Ceretti, Leo DiCaprio's current girlfriend, when raised to the power of 0.43 is approximately 4.0 rounded to two decimal places. Her current age is 25 years old.[0m

[1m> Finished chain.[0m
```

```output
{'input': "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?",
 'output': "Vittoria Ceretti, Leo DiCaprio's current girlfriend, when raised to the power of 0.43 is approximately 4.0 rounded to two decimal places. Her current age is 25 years old."}
```

와우! 우리 오픈 소스 7b 파라미터 Zephyr 모델은 다음을 수행할 수 있었습니다:

1. 일련의 행동 계획: `Leo DiCaprio의 현재 여자친구가 누구인지 알아내기 위해 Search 도구를 사용해야 합니다. 그런 다음, 그녀의 현재 나이를 0.43의 제곱으로 올리기 위해 Calculator 도구를 사용해야 합니다.`
2. SerpAPI 도구를 사용하여 Leo DiCaprio의 현재 여자친구가 누구인지 검색
3. 그녀의 나이를 알아내기 위해 다시 검색 실행
4. 마지막으로 계산기 도구를 사용하여 그녀의 나이를 0.43의 제곱으로 계산

오픈 소스 LLM이 범용 추론 에이전트로 얼마나 멀리 갈 수 있는지 보는 것은 흥미롭습니다. 직접 시도해보세요!