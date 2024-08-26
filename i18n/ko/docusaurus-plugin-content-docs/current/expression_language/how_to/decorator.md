---
translated: true
---

# @chain 데코레이터로 실행 가능한 함수 생성

`@chain` 데코레이터를 추가하여 임의의 함수를 체인으로 변환할 수도 있습니다. 이는 [`RunnableLambda`](/docs/expression_language/primitives/functions)로 래핑하는 것과 기능적으로 동일합니다.

이렇게 하면 체인을 올바르게 추적하여 관찰 가능성이 향상됩니다. 이 함수 내에서 실행 가능한 항목을 호출하면 중첩된 하위 항목으로 추적됩니다.

또한 이것을 다른 실행 가능한 항목처럼 사용하고 체인으로 구성하는 등의 작업을 수행할 수 있습니다.

실제로 어떻게 동작하는지 살펴보겠습니다!

```python
%pip install --upgrade --quiet langchain langchain-openai
```

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import chain
from langchain_openai import ChatOpenAI
```

```python
prompt1 = ChatPromptTemplate.from_template("너 {topic}에 대한 농담을 해줘")
prompt2 = ChatPromptTemplate.from_template("이 농담의 주제는 무엇인가요: {joke}")
```

```python
@chain
def custom_chain(text):
    prompt_val1 = prompt1.invoke({"topic": text})
    output1 = ChatOpenAI().invoke(prompt_val1)
    parsed_output1 = StrOutputParser().invoke(output1)
    chain2 = prompt2 | ChatOpenAI() | StrOutputParser()
    return chain2.invoke({"joke": parsed_output1})
```

`custom_chain`은 이제 실행 가능하므로 `invoke`를 사용해야 합니다.

```python
custom_chain.invoke("곰")
```

```output
'이 농담의 주제는 곰입니다.'
```

LangSmith 추적을 확인하면 `custom_chain` 추적이 있으며, 그 아래에 OpenAI 호출이 중첩되어 있는 것을 볼 수 있습니다.