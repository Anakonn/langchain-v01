---
keywords:
- RunnableBinding
- LCEL
sidebar_position: 2
title: 'バインディング: ランタイム引数の添付'
translated: true
---

# バインディング: ランタイム引数の添付

時には、前の Runnable の出力の一部ではなく、ユーザー入力の一部でもない、定数引数を使って Runnable シーケンス内の Runnable を呼び出したい場合があります。この場合は、`Runnable.bind()` を使ってこれらの引数を渡すことができます。

簡単なプロンプト + モデルシーケンスがあるとします:

```python
%pip install --upgrade --quiet  langchain langchain-openai
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
            "Write out the following equation using algebraic symbols then solve it. Use the format\n\nEQUATION:...\nSOLUTION:...\n\n",
        ),
        ("human", "{equation_statement}"),
    ]
)
model = ChatOpenAI(temperature=0)
runnable = (
    {"equation_statement": RunnablePassthrough()} | prompt | model | StrOutputParser()
)

print(runnable.invoke("x raised to the third plus seven equals 12"))
```

```output
EQUATION: x^3 + 7 = 12

SOLUTION:
Subtracting 7 from both sides of the equation, we get:
x^3 = 12 - 7
x^3 = 5

Taking the cube root of both sides, we get:
x = ∛5

Therefore, the solution to the equation x^3 + 7 = 12 is x = ∛5.
```

そして、特定の `stop` ワードでモデルを呼び出したい場合は:

```python
runnable = (
    {"equation_statement": RunnablePassthrough()}
    | prompt
    | model.bind(stop="SOLUTION")
    | StrOutputParser()
)
print(runnable.invoke("x raised to the third plus seven equals 12"))
```

```output
EQUATION: x^3 + 7 = 12
```

## OpenAI 関数の添付

バインディングの特に有用な用途の 1 つは、互換性のある OpenAI モデルに OpenAI 関数を添付することです:

```python
function = {
    "name": "solver",
    "description": "Formulates and solves an equation",
    "parameters": {
        "type": "object",
        "properties": {
            "equation": {
                "type": "string",
                "description": "The algebraic expression of the equation",
            },
            "solution": {
                "type": "string",
                "description": "The solution to the equation",
            },
        },
        "required": ["equation", "solution"],
    },
}
```

```python
# Need gpt-4 to solve this one correctly
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Write out the following equation using algebraic symbols then solve it.",
        ),
        ("human", "{equation_statement}"),
    ]
)
model = ChatOpenAI(model="gpt-4", temperature=0).bind(
    function_call={"name": "solver"}, functions=[function]
)
runnable = {"equation_statement": RunnablePassthrough()} | prompt | model
runnable.invoke("x raised to the third plus seven equals 12")
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'solver', 'arguments': '{\n"equation": "x^3 + 7 = 12",\n"solution": "x = ∛5"\n}'}}, example=False)
```

## OpenAI ツールの添付

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
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
model.invoke("What's the weather in SF, NYC and LA?")
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_zHN0ZHwrxM7nZDdqTp6dkPko', 'function': {'arguments': '{"location": "San Francisco, CA", "unit": "celsius"}', 'name': 'get_current_weather'}, 'type': 'function'}, {'id': 'call_aqdMm9HBSlFW9c9rqxTa7eQv', 'function': {'arguments': '{"location": "New York, NY", "unit": "celsius"}', 'name': 'get_current_weather'}, 'type': 'function'}, {'id': 'call_cx8E567zcLzYV2WSWVgO63f1', 'function': {'arguments': '{"location": "Los Angeles, CA", "unit": "celsius"}', 'name': 'get_current_weather'}, 'type': 'function'}]})
```
