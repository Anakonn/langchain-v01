---
sidebar_label: OpenAI
translated: true
---

# ChatOpenAI

이 노트북은 OpenAI 채팅 모델을 시작하는 방법을 다룹니다.

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
```

```python
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

위 셀은 OpenAI API 키가 환경 변수에 설정되어 있다고 가정합니다. API 키 및/또는 조직 ID를 수동으로 지정하려면 다음 코드를 사용하십시오:

```python
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0, api_key="YOUR_API_KEY", openai_organization="YOUR_ORGANIZATION_ID")
```

openai_organization 매개변수가 해당되지 않는 경우 제거하십시오.

```python
messages = [
    ("system", "You are a helpful assistant that translates English to French."),
    ("human", "Translate this sentence from English to French. I love programming."),
]
llm.invoke(messages)
```

```output
AIMessage(content="J'adore programmer.", response_metadata={'token_usage': {'completion_tokens': 6, 'prompt_tokens': 34, 'total_tokens': 40}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'stop', 'logprobs': None}, id='run-8591eae1-b42b-402b-a23a-dfdb0cd151bd-0')
```

## 체이닝

모델을 프롬프트 템플릿과 체이닝할 수 있습니다:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant that translates {input_language} to {output_language}.",
        ),
        ("human", "{input}"),
    ]
)

chain = prompt | llm
chain.invoke(
    {
        "input_language": "English",
        "output_language": "German",
        "input": "I love programming.",
    }
)
```

```output
AIMessage(content='Ich liebe Programmieren.', response_metadata={'token_usage': {'completion_tokens': 5, 'prompt_tokens': 26, 'total_tokens': 31}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'stop', 'logprobs': None}, id='run-94fa6741-c99b-4513-afce-c3f562631c79-0')
```

## 툴 호출

OpenAI에는 [툴 호출](https://platform.openai.com/docs/guides/function-calling) API가 있으며, 여기서 툴과 해당 인수를 설명하고 모델이 호출할 툴과 해당 툴에 대한 입력을 포함하는 JSON 객체를 반환할 수 있습니다. 툴 호출은 툴 사용 체인 및 에이전트를 구축하는 데 매우 유용하며, 모델에서 구조화된 출력을 얻는 데 일반적으로 유용합니다.

### ChatOpenAI.bind_tools()

`ChatOpenAI.bind_tools`를 사용하면 Pydantic 클래스, dict 스키마, LangChain 툴 또는 함수를 툴로 모델에 쉽게 전달할 수 있습니다. 내부적으로 이것들은 Anthropic 툴 스키마로 변환되며, 이는 다음과 같습니다:

```
{
    "name": "...",
    "description": "...",
    "parameters": {...}  # JSONSchema
}
```

그리고 모든 모델 호출에 전달됩니다.

```python
from langchain_core.pydantic_v1 import BaseModel, Field

class GetWeather(BaseModel):
    """Get the current weather in a given location"""
    location: str = Field(..., description="The city and state, e.g. San Francisco, CA")

llm_with_tools = llm.bind_tools([GetWeather])
```

```python
ai_msg = llm_with_tools.invoke(
    "what is the weather like in San Francisco",
)
ai_msg
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_H7fABDuzEau48T10Qn0Lsh0D', 'function': {'arguments': '{"location":"San Francisco"}', 'name': 'GetWeather'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 15, 'prompt_tokens': 70, 'total_tokens': 85}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-b469135e-2718-446a-8164-eef37e672ba2-0', tool_calls=[{'name': 'GetWeather', 'args': {'location': 'San Francisco'}, 'id': 'call_H7fABDuzEau48T10Qn0Lsh0D'}])
```

### AIMessage.tool_calls

AIMessage에는 `tool_calls` 속성이 있습니다. 이는 모델 제공자에 관계없이 표준화된 ToolCall 형식으로 제공됩니다.

```python
ai_msg.tool_calls
```

```output
[{'name': 'GetWeather',
  'args': {'location': 'San Francisco'},
  'id': 'call_H7fABDuzEau48T10Qn0Lsh0D'}]
```

툴 바인딩 및 툴 호출 출력에 대한 자세한 내용은 [툴 호출](/docs/modules/model_io/chat/function_calling/) 문서를 참조하십시오.

## 파인튜닝

해당 `modelName` 매개변수를 전달하여 파인튜닝된 OpenAI 모델을 호출할 수 있습니다.

이는 일반적으로 `ft:{OPENAI_MODEL_NAME}:{ORG_NAME}::{MODEL_ID}` 형식을 따릅니다. 예를 들어:

```python
fine_tuned_model = ChatOpenAI(
    temperature=0, model_name="ft:gpt-3.5-turbo-0613:langchain::7qTVM5AR"
)

fine_tuned_model(messages)
```

```output
AIMessage(content="J'adore la programmation.", additional_kwargs={}, example=False)
```