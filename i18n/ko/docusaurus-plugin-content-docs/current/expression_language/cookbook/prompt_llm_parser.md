---
sidebar_position: 0
title: 프롬프트 + LLM
translated: true
---

가장 일반적이고 유용한 구성은 다음과 같습니다:

`PromptTemplate` / `ChatPromptTemplate` -> `LLM` / `ChatModel` -> `OutputParser`

거의 모든 다른 체인은 이 빌딩 블록을 사용하여 구축됩니다.

## PromptTemplate + LLM

가장 간단한 구성은 프롬프트와 모델을 결합하여 사용자의 입력을 받아 프롬프트에 추가하고, 모델에 전달한 후, 원시 모델 출력을 반환하는 체인을 만드는 것입니다.

참고로, 여기서 PromptTemplate/ChatPromptTemplates와 LLMs/ChatModels을 자유롭게 섞어 사용할 수 있습니다.
%pip install --upgrade --quiet langchain langchain-openai

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template("너 {foo}에 대한 농담을 해줘")
model = ChatOpenAI()
chain = prompt | model
```

```python
chain.invoke({"foo": "곰"})
```

```output
AIMessage(content="곰은 왜 신발을 신지 않을까요?\n\n왜냐하면 곰발이니까요!", additional_kwargs={}, example=False)
```

종종 각 모델 호출에 전달될 kwargs를 첨부하고 싶습니다. 다음은 그 몇 가지 예입니다:

### 멈춤 시퀀스 첨부

```python
chain = prompt | model.bind(stop=["\n"])
```

```python
chain.invoke({"foo": "곰"})
```

```output
AIMessage(content='곰은 왜 신발을 신지 않을까요?', additional_kwargs={}, example=False)
```

### 함수 호출 정보 첨부

```python
functions = [
    {
        "name": "joke",
        "description": "농담",
        "parameters": {
            "type": "object",
            "properties": {
                "setup": {"type": "string", "description": "농담의 서두"},
                "punchline": {
                    "type": "string",
                    "description": "농담의 결말",
                },
            },
            "required": ["setup", "punchline"],
        },
    }
]
chain = prompt | model.bind(function_call={"name": "joke"}, functions=functions)
```

```python
chain.invoke({"foo": "곰"}, config={})
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'joke', 'arguments': '{\n  "setup": "곰은 왜 신발을 신지 않을까요?",\n  "punchline": "왜냐하면 곰발이니까요!"\n}'}}, example=False)
```

## PromptTemplate + LLM + OutputParser

우리는 또한 출력 파서를 추가하여 원시 LLM/ChatModel 출력을 더 작업하기 쉬운 형식으로 쉽게 변환할 수 있습니다

```python
from langchain_core.output_parsers import StrOutputParser

chain = prompt | model | StrOutputParser()
```

이제 문자열을 반환한다는 점에 유의하십시오. 이는 다운스트림 작업에 훨씬 더 작업하기 쉬운 형식입니다.

```python
chain.invoke({"foo": "곰"})
```

```output
"곰은 왜 신발을 신지 않을까요?\n\n왜냐하면 곰발이니까요!"
```

### 함수 출력 파서

반환할 함수를 지정하면 직접 파싱하고 싶을 수 있습니다

```python
from langchain.output_parsers.openai_functions import JsonOutputFunctionsParser

chain = (
    prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonOutputFunctionsParser()
)
```

```python
chain.invoke({"foo": "곰"})
```

```output
{'setup': "곰은 왜 패스트푸드를 좋아하지 않나요?",
 'punchline': "왜냐하면 잡을 수 없으니까요!"}
```

```python
from langchain.output_parsers.openai_functions import JsonKeyOutputFunctionsParser

chain = (
    prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="setup")
)
```

```python
chain.invoke({"foo": "곰"})
```

```output
"곰은 왜 신발을 신지 않을까요?"
```

## 입력 단순화

호출을 더욱 단순화하기 위해, `RunnableParallel`을 추가하여 프롬프트 입력 딕셔너리를 생성하는 작업을 처리할 수 있습니다:

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

map_ = RunnableParallel(foo=RunnablePassthrough())
chain = (
    map_
    | prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="setup")
)
```

```python
chain.invoke("곰")
```

```output
"곰은 왜 신발을 신지 않을까요?"
```

다른 Runnable과 맵을 구성하고 있기 때문에, 일부 문법적 설탕을 사용하여 단순히 딕셔너리를 사용할 수도 있습니다:

```python
chain = (
    {"foo": RunnablePassthrough()}
    | prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="setup")
)
```

```python
chain.invoke("곰")
```

```output
"곰은 왜 패스트푸드를 좋아하지 않나요?"
```