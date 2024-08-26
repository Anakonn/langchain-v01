---
sidebar_class_name: hidden
sidebar_position: 4
translated: true
---

# 도구

도구는 에이전트, 체인 또는 LLM이 세계와 상호 작용할 수 있는 인터페이스입니다.
이것들은 다음과 같은 몇 가지 요소로 구성됩니다:

1. 도구의 이름
2. 도구가 무엇인지에 대한 설명
3. 도구의 입력에 대한 JSON 스키마
4. 호출할 함수
5. 도구 결과를 사용자에게 직접 반환할지 여부

이 모든 정보를 가지고 있는 것이 유용한 이유는 이 정보를 사용하여 행동 시스템을 구축할 수 있기 때문입니다! 이름, 설명 및 JSON 스키마는 LLM이 어떤 작업을 수행할지 알 수 있도록 프롬프트에 사용될 수 있으며, 호출할 함수는 해당 작업을 수행하는 것과 동일합니다.

도구의 입력이 간단할수록 LLM이 사용하기 쉽습니다.
많은 에이전트는 단일 문자열 입력만 작동합니다.
에이전트 유형과 복잡한 입력을 처리할 수 있는 에이전트에 대한 정보는 [이 문서](../agents/agent_types)를 참조하세요.

중요한 것은 이름, 설명 및 JSON 스키마(사용된 경우)가 모두 프롬프트에 사용된다는 것입니다. 따라서 이것들이 명확하고 도구를 어떻게 사용해야 하는지 정확히 설명하는 것이 매우 중요합니다. LLM이 도구 사용 방법을 이해하지 못하는 경우 기본 이름, 설명 또는 JSON 스키마를 변경해야 할 수 있습니다.

## 기본 도구

도구 사용 방법을 살펴보겠습니다. 이를 위해 내장 도구를 사용할 것입니다.

```python
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
```

이제 도구를 초기화합니다. 여기서 원하는 대로 구성할 수 있습니다.

```python
api_wrapper = WikipediaAPIWrapper(top_k_results=1, doc_content_chars_max=100)
tool = WikipediaQueryRun(api_wrapper=api_wrapper)
```

이것이 기본 이름입니다.

```python
tool.name
```

```output
'Wikipedia'
```

이것이 기본 설명입니다.

```python
tool.description
```

```output
'A wrapper around Wikipedia. Useful for when you need to answer general questions about people, places, companies, facts, historical events, or other subjects. Input should be a search query.'
```

이것이 입력에 대한 기본 JSON 스키마입니다.

```python
tool.args
```

```output
{'query': {'title': 'Query', 'type': 'string'}}
```

사용자에게 직접 결과를 반환할지 여부를 확인할 수 있습니다.

```python
tool.return_direct
```

```output
False
```

사전 입력으로 이 도구를 호출할 수 있습니다.

```python
tool.run({"query": "langchain"})
```

```output
'Page: LangChain\nSummary: LangChain is a framework designed to simplify the creation of applications '
```

단일 문자열 입력으로도 이 도구를 호출할 수 있습니다.
이 도구는 단일 입력만 필요하기 때문에 이렇게 할 수 있습니다.
여러 입력이 필요한 경우에는 그렇게 할 수 없습니다.

```python
tool.run("langchain")
```

```output
'Page: LangChain\nSummary: LangChain is a framework designed to simplify the creation of applications '
```

## 기본 도구 사용자 정의

내장 이름, 설명 및 인수의 JSON 스키마를 수정할 수도 있습니다.

인수의 JSON 스키마를 정의할 때는 함수의 입력을 그대로 유지해야 하므로 이를 변경해서는 안 됩니다. 하지만 각 입력에 대한 사용자 정의 설명을 쉽게 정의할 수 있습니다.

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class WikiInputs(BaseModel):
    """Inputs to the wikipedia tool."""

    query: str = Field(
        description="query to look up in Wikipedia, should be 3 or less words"
    )
```

```python
tool = WikipediaQueryRun(
    name="wiki-tool",
    description="look up things in wikipedia",
    args_schema=WikiInputs,
    api_wrapper=api_wrapper,
    return_direct=True,
)
```

```python
tool.name
```

```output
'wiki-tool'
```

```python
tool.description
```

```output
'look up things in wikipedia'
```

```python
tool.args
```

```output
{'query': {'title': 'Query',
  'description': 'query to look up in Wikipedia, should be 3 or less words',
  'type': 'string'}}
```

```python
tool.return_direct
```

```output
True
```

```python
tool.run("langchain")
```

```output
'Page: LangChain\nSummary: LangChain is a framework designed to simplify the creation of applications '
```

## 더 많은 주제

이것은 LangChain의 도구에 대한 간단한 소개였지만, 더 많은 것을 배울 수 있습니다.

**[내장 도구](/docs/integrations/tools/)**: 모든 내장 도구 목록은 [이 페이지](/docs/integrations/tools/)를 참조하세요.

**[사용자 정의 도구](./custom_tools)**: 내장 도구가 유용하지만 자신만의 도구를 정의해야 할 가능성이 매우 높습니다. 방법은 [이 가이드](./custom_tools)를 참조하세요.

**[도구 키트](./toolkits)**: 도구 키트는 잘 작동하는 도구 모음입니다. 자세한 설명과 모든 내장 도구 키트 목록은 [이 페이지](./toolkits)를 참조하세요.

**[OpenAI 함수로서의 도구](./tools_as_openai_functions)**: 도구는 OpenAI 함수와 매우 유사하며 쉽게 해당 형식으로 변환할 수 있습니다. 방법은 [이 노트북](./tools_as_openai_functions)을 참조하세요.
