---
sidebar_position: 3
title: 빠른 시작
translated: true
---

언어 모델은 텍스트를 출력합니다. 그러나 때때로 단순한 텍스트 이상의 구조화된 정보를 얻고 싶을 수 있습니다. 이 경우 출력 파서가 도움이 됩니다.

출력 파서는 언어 모델 응답을 구조화하는 클래스입니다. 출력 파서가 구현해야 하는 두 가지 주요 메서드는 다음과 같습니다:

- "형식 지침 가져오기": 언어 모델의 출력이 어떻게 형식화되어야 하는지에 대한 지침을 반환하는 메서드.
- "구문 분석": 언어 모델의 응답으로 간주되는 문자열을 입력받아 구조화된 데이터로 구문 분석하는 메서드.

그리고 선택적인 하나의 메서드:

- "프롬프트와 함께 구문 분석": 언어 모델의 응답으로 간주되는 문자열과 해당 응답을 생성한 프롬프트를 입력받아 구조화된 데이터로 구문 분석하는 메서드. 프롬프트는 OutputParser가 출력을 다시 시도하거나 수정하려는 경우 필요한 정보를 제공하기 위해 제공됩니다.

## 시작하기

아래에서는 주요 출력 파서 유형인 `PydanticOutputParser`에 대해 살펴봅니다.

```python
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_openai import OpenAI

model = OpenAI(model_name="gpt-3.5-turbo-instruct", temperature=0.0)


# Define your desired data structure.
class Joke(BaseModel):
    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")

    # You can add custom validation logic easily with Pydantic.
    @validator("setup")
    def question_ends_with_question_mark(cls, field):
        if field[-1] != "?":
            raise ValueError("Badly formed question!")
        return field


# Set up a parser + inject instructions into the prompt template.
parser = PydanticOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

# And a query intended to prompt a language model to populate the data structure.
prompt_and_model = prompt | model
output = prompt_and_model.invoke({"query": "Tell me a joke."})
parser.invoke(output)
```

```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```

## LCEL

출력 파서는 [Runnable 인터페이스](/docs/expression_language/interface)를 구현하며, 이는 [LangChain Expression Language (LCEL)](/docs/expression_language/)의 기본 구성 요소입니다. 따라서 `invoke`, `ainvoke`, `stream`, `astream`, `batch`, `abatch`, `astream_log` 호출을 지원합니다.

출력 파서는 문자열 또는 `BaseMessage`를 입력으로 받아 임의의 유형을 반환할 수 있습니다.

```python
parser.invoke(output)
```

```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```

파서를 수동으로 호출하는 대신 `Runnable` 시퀀스에 추가할 수도 있습니다:

```python
chain = prompt | model | parser
chain.invoke({"query": "Tell me a joke."})
```

```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```

모든 파서는 스트리밍 인터페이스를 지원하지만, 출력 유형에 따라 일부 파서만 부분적으로 구문 분석된 객체를 통해 스트리밍할 수 있습니다. 부분 객체를 구성할 수 없는 파서는 완전히 구문 분석된 출력만 반환합니다.

`SimpleJsonOutputParser`는 부분 출력을 통해 스트리밍할 수 있습니다:

```python
from langchain.output_parsers.json import SimpleJsonOutputParser

json_prompt = PromptTemplate.from_template(
    "Return a JSON object with an `answer` key that answers the following question: {question}"
)
json_parser = SimpleJsonOutputParser()
json_chain = json_prompt | model | json_parser
```

```python
list(json_chain.stream({"question": "Who invented the microscope?"}))
```

```output
[{},
 {'answer': ''},
 {'answer': 'Ant'},
 {'answer': 'Anton'},
 {'answer': 'Antonie'},
 {'answer': 'Antonie van'},
 {'answer': 'Antonie van Lee'},
 {'answer': 'Antonie van Leeu'},
 {'answer': 'Antonie van Leeuwen'},
 {'answer': 'Antonie van Leeuwenho'},
 {'answer': 'Antonie van Leeuwenhoek'}]
```

반면 `PydanticOutputParser`는 그렇지 않습니다:

```python
list(chain.stream({"query": "Tell me a joke."}))
```

```output
[Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')]
```
