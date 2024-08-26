---
sidebar_class_name: hidden
translated: true
---

# [Deprecated] 실험적 Anthropic 도구 래퍼

::: {.callout-warning}

Anthropic API는 도구 호출을 공식적으로 지원하므로 이 해결 방법은 더 이상 필요하지 않습니다. `langchain-anthropic>=0.1.5` 버전의 [ChatAnthropic](/docs/integrations/chat/anthropic)을 사용하세요.

:::

이 노트북은 도구 호출 및 구조화된 출력 기능을 제공하는 실험적 Anthropic 래퍼를 사용하는 방법을 보여줍니다. Anthropic의 가이드 [여기](https://docs.anthropic.com/claude/docs/functions-external-tools)를 따릅니다.

래퍼는 `langchain-anthropic` 패키지에서 사용할 수 있으며, llm의 XML 출력을 파싱하기 위해 선택적 종속성 `defusedxml`도 필요합니다.

참고: 이것은 도구 호출의 Anthropic 공식 구현으로 대체될 베타 기능이지만, 그 동안 테스트 및 실험에 유용합니다.

```python
%pip install -qU langchain-anthropic defusedxml
from langchain_anthropic.experimental import ChatAnthropicTools
```

## 도구 바인딩

`ChatAnthropicTools`는 Pydantic 모델 또는 BaseTools를 llm에 전달할 수 있는 `bind_tools` 메서드를 제공합니다.

```python
from langchain_core.pydantic_v1 import BaseModel


class Person(BaseModel):
    name: str
    age: int


model = ChatAnthropicTools(model="claude-3-opus-20240229").bind_tools(tools=[Person])
model.invoke("나는 27살의 에릭이라고 합니다")
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'function': {'name': 'Person', 'arguments': '{"name": "Erick", "age": "27"}'}, 'type': 'function'}]})
```

## 구조화된 출력

`ChatAnthropicTools`는 값 추출을 위한 [`with_structured_output` 사양](/docs/modules/model_io/chat/structured_output)도 구현합니다. 주의: 이 기능은 도구 호출을 명시적으로 제공하는 모델보다 안정적이지 않을 수 있습니다.

```python
chain = ChatAnthropicTools(model="claude-3-opus-20240229").with_structured_output(
    Person
)
chain.invoke("나는 27살의 에릭이라고 합니다")
```

```output
Person(name='Erick', age=27)
```