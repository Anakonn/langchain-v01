---
keywords:
- RunnableBinding
- LCEL
sidebar_position: 2
title: '바인딩: 런타임 인수 첨부'
translated: true
---

# 바인딩: 런타임 인수 첨부

때때로 Runnable 시퀀스 내에서 사용자 입력의 일부도 아니고, 시퀀스의 이전 Runnable 출력의 일부도 아닌 상수 인수로 Runnable을 호출하고 싶을 때가 있습니다. 이러한 인수를 전달하기 위해 `Runnable.bind()`를 사용할 수 있습니다.

간단한 프롬프트 + 모델 시퀀스를 가정해 봅시다:

```python
%pip install --upgrade --quiet langchain langchain-openai
```

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "다음 방정식을 대수학 기호를 사용하여 작성한 다음 해결하세요. 형식은 다음과 같습니다\n\nEQUATION:...\nSOLUTION:...\n\n",
        ),
        ("human", "{equation_statement}"),
    ]
)
model = ChatOpenAI(temperature=0)
runnable = (
    {"equation_statement": RunnablePassthrough()} | prompt | model | StrOutputParser()
)

print(runnable.invoke("x 세제곱 더하기 7은 12와 같다"))
```

```output
EQUATION: x^3 + 7 = 12

SOLUTION:
양변에서 7을 뺍니다:
x^3 = 12 - 7
x^3 = 5

양변의 세제곱근을 구합니다:
x = ∛5

따라서, 방정식 x^3 + 7 = 12의 해는 x = ∛5입니다.
```

모델을 특정 `stop` 단어와 함께 호출하고 싶습니다:

```python
runnable = (
    {"equation_statement": RunnablePassthrough()}
    | prompt
    | model.bind(stop="SOLUTION")
    | StrOutputParser()
)
print(runnable.invoke("x 세제곱 더하기 7은 12와 같다"))
```

```output
EQUATION: x^3 + 7 = 12
```

## OpenAI 함수 첨부

바인딩의 특히 유용한 응용 중 하나는 OpenAI 함수들을 호환 가능한 OpenAI 모델에 첨부하는 것입니다:

```python
function = {
    "name": "solver",
    "description": "방정식을 공식화하고 해결",
    "parameters": {
        "type": "object",
        "properties": {
            "equation": {
                "type": "string",
                "description": "방정식의 대수적 표현",
            },
            "solution": {
                "type": "string",
                "description": "방정식의 해",
            },
        },
        "required": ["equation", "solution"],
    },
}
```

```python
# 올바르게 해결하려면 gpt-4가 필요합니다.

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "다음 방정식을 대수학 기호를 사용하여 작성한 다음 해결하세요.",
        ),
        ("human", "{equation_statement}"),
    ]
)
model = ChatOpenAI(model="gpt-4", temperature=0).bind(
    function_call={"name": "solver"}, functions=[function]
)
runnable = {"equation_statement": RunnablePassthrough()} | prompt | model
runnable.invoke("x 세제곱 더하기 7은 12와 같다")
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'solver', 'arguments': '{\n"equation": "x^3 + 7 = 12",\n"solution": "x = ∛5"\n}'}}, example=False)
```

## OpenAI 도구 첨부

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "지정된 위치의 현재 날씨 가져오기",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "도시와 주, 예: San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        },
    }
]
```

```python
model = ChatOpenAI(model="gpt-3.5-turbo-1106").bind(tools=tools)
model.invoke("SF, NYC, LA의 날씨는 어때?")
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_zHN0ZHwrxM7nZDdqTp6dkPko', 'function': {'arguments': '{"location": "San Francisco, CA", "unit": "celsius"}', 'name': 'get_current_weather'}, 'type': 'function'}, {'id': 'call_aqdMm9HBSlFW9c9rqxTa7eQv', 'function': {'arguments': '{"location": "New York, NY", "unit": "celsius"}', 'name': 'get_current_weather'}, 'type': 'function'}, {'id': 'call_cx8E567zcLzYV2WSWVgO63f1', 'function': {'arguments': '{"location": "Los Angeles, CA", "unit": "celsius"}', 'name': 'get_current_weather'}, 'type': 'function'}]})
```