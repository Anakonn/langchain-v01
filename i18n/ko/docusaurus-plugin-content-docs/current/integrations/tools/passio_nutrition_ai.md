---
translated: true
---

# 빠른 시작

NutritionAI를 통해 에이전트에게 슈퍼 푸드-영양 파워를 부여하는 방법을 이해하기 위해, Passio NutritionAI를 통해 해당 정보를 찾을 수 있는 에이전트를 만들어 보겠습니다.

## 도구 정의

먼저 [Passio NutritionAI 도구](/docs/integrations/tools/passio_nutrition_ai)를 만들어야 합니다.

### [Passio Nutrition AI](/docs/integrations/tools/passio_nutrition_ai)

LangChain에는 Passio NutritionAI를 쉽게 사용하여 식품 영양 정보를 찾을 수 있는 내장 도구가 있습니다.
API 키가 필요하다는 점에 유의하세요 - 무료 티어가 있습니다.

API 키를 만든 후에는 다음과 같이 내보내야 합니다:

```bash
export NUTRITIONAI_SUBSCRIPTION_KEY="..."
```

... 또는 `dotenv` 패키지와 같은 다른 방법을 통해 Python 환경에 제공해야 합니다. 생성자 호출을 통해 키를 명시적으로 제어할 수도 있습니다.

```python
from dotenv import load_dotenv
from langchain_core.utils import get_from_env

load_dotenv()

nutritionai_subscription_key = get_from_env(
    "nutritionai_subscription_key", "NUTRITIONAI_SUBSCRIPTION_KEY"
)
```

```python
from langchain_community.tools.passio_nutrition_ai import NutritionAI
from langchain_community.utilities.passio_nutrition_ai import NutritionAIAPI
```

```python
nutritionai_search = NutritionAI(api_wrapper=NutritionAIAPI())
```

```python
nutritionai_search.invoke("chicken tikka masala")
```

```python
nutritionai_search.invoke("Schnuck Markets sliced pepper jack cheese")
```

### 도구

이제 도구를 만들었으므로, 향후 사용할 도구 목록을 만들 수 있습니다.

```python
tools = [nutritionai_search]
```

## 에이전트 생성

도구를 정의했으므로, 에이전트를 만들 수 있습니다. OpenAI Functions 에이전트를 사용할 것입니다 - 이 유형의 에이전트와 다른 옵션에 대한 자세한 내용은 [이 가이드](/docs/modules/agents/agent_types/)를 참조하세요.

먼저 에이전트를 안내할 LLM을 선택합니다.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
```

다음으로 에이전트를 안내할 프롬프트를 선택합니다.

```python
from langchain import hub

# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-functions-agent")
prompt.messages
```

```output
[SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=[], template='You are a helpful assistant')),
 MessagesPlaceholder(variable_name='chat_history', optional=True),
 HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['input'], template='{input}')),
 MessagesPlaceholder(variable_name='agent_scratchpad')]
```

이제 LLM, 프롬프트, 도구를 사용하여 에이전트를 초기화할 수 있습니다. 에이전트는 입력을 받아 어떤 작업을 수행할지 결정합니다. 중요한 점은 에이전트가 직접 작업을 실행하지 않고, AgentExecutor(다음 단계)가 실행한다는 것입니다. 이 구성 요소에 대한 자세한 내용은 [개념 가이드](/docs/modules/agents/concepts)를 참조하세요.

```python
from langchain.agents import create_openai_functions_agent

agent = create_openai_functions_agent(llm, tools, prompt)
```

마지막으로 에이전트(두뇌)와 도구를 AgentExecutor(에이전트와 도구를 반복적으로 호출하고 실행)에 결합합니다. 이 구성 요소에 대한 자세한 내용은 [개념 가이드](/docs/modules/agents/concepts)를 참조하세요.

```python
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## 에이전트 실행

이제 에이전트를 몇 가지 쿼리에 실행할 수 있습니다! 현재는 모두 **상태 없는** 쿼리(이전 상호 작용을 기억하지 않음)입니다.

```python
agent_executor.invoke({"input": "hi!"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHello! How can I assist you today?[0m

[1m> Finished chain.[0m
```

```output
{'input': 'hi!', 'output': 'Hello! How can I assist you today?'}
```

```python
agent_executor.invoke({"input": "how many calories are in a slice pepperoni pizza?"})
```

이 메시지를 자동으로 추적하려면 RunnableWithMessageHistory로 감싸면 됩니다. 이 기능 사용 방법에 대한 자세한 내용은 [이 가이드](/docs/expression_language/how_to/message_history)를 참조하세요.

```python
agent_executor.invoke(
    {"input": "I had bacon and eggs for breakfast.  How many calories is that?"}
)
```

```python
agent_executor.invoke(
    {
        "input": "I had sliced pepper jack cheese for a snack.  How much protein did I have?"
    }
)
```

```python
agent_executor.invoke(
    {
        "input": "I had sliced colby cheese for a snack. Give me calories for this Schnuck Markets product."
    }
)
```

```python
agent_executor.invoke(
    {
        "input": "I had chicken tikka masala for dinner.  how much calories, protein, and fat did I have with default quantity?"
    }
)
```

## 결론

이상입니다! 이 빠른 시작에서는 식품-영양 정보를 답변에 포함할 수 있는 간단한 에이전트를 만드는 방법을 다루었습니다. 에이전트는 복잡한 주제이며, 더 많은 것을 배울 수 있습니다!
