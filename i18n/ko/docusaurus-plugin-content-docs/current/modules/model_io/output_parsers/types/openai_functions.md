---
translated: true
---

# OpenAI 함수

이러한 출력 파서는 OpenAI 함수 호출을 사용하여 출력을 구조화합니다. 이는 함수 호출을 지원하는 모델에서만 사용할 수 있습니다. 여러 가지 변형이 있습니다:

- [JsonOutputFunctionsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_functions.JsonOutputFunctionsParser.html#langchain_core.output_parsers.openai_functions.JsonOutputFunctionsParser): 함수 호출의 인수를 JSON으로 반환합니다.
- [PydanticOutputFunctionsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_functions.PydanticOutputFunctionsParser.html#langchain_core.output_parsers.openai_functions.PydanticOutputFunctionsParser): 함수 호출의 인수를 Pydantic 모델로 반환합니다.
- [JsonKeyOutputFunctionsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_functions.JsonKeyOutputFunctionsParser.html#langchain_core.output_parsers.openai_functions.JsonKeyOutputFunctionsParser): 함수 호출의 특정 키 값을 JSON으로 반환합니다.
- [PydanticAttrOutputFunctionsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_functions.PydanticAttrOutputFunctionsParser.html#langchain_core.output_parsers.openai_functions.PydanticAttrOutputFunctionsParser): 함수 호출의 특정 키 값을 Pydantic 모델로 반환합니다.

```python
from langchain_community.utils.openai_functions import (
    convert_pydantic_to_openai_function,
)
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_openai import ChatOpenAI
```

```python
class Joke(BaseModel):
    """Joke to tell user."""

    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")


openai_functions = [convert_pydantic_to_openai_function(Joke)]
```

```python
model = ChatOpenAI(temperature=0)
```

```python
prompt = ChatPromptTemplate.from_messages(
    [("system", "You are helpful assistant"), ("user", "{input}")]
)
```

## JsonOutputFunctionsParser

```python
from langchain.output_parsers.openai_functions import JsonOutputFunctionsParser
```

```python
parser = JsonOutputFunctionsParser()
```

```python
chain = prompt | model.bind(functions=openai_functions) | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
{'setup': "Why don't scientists trust atoms?",
 'punchline': 'Because they make up everything!'}
```

```python
for s in chain.stream({"input": "tell me a joke"}):
    print(s)
```

```output
{}
{'setup': ''}
{'setup': 'Why'}
{'setup': 'Why don'}
{'setup': "Why don't"}
{'setup': "Why don't scientists"}
{'setup': "Why don't scientists trust"}
{'setup': "Why don't scientists trust atoms"}
{'setup': "Why don't scientists trust atoms?", 'punchline': ''}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}
```

## JsonKeyOutputFunctionsParser

이는 반환된 응답에서 단일 키를 추출합니다. 여러 항목을 반환하려는 경우 유용합니다.

```python
from typing import List

from langchain.output_parsers.openai_functions import JsonKeyOutputFunctionsParser
```

```python
class Jokes(BaseModel):
    """Jokes to tell user."""

    joke: List[Joke]
    funniness_level: int
```

```python
parser = JsonKeyOutputFunctionsParser(key_name="joke")
```

```python
openai_functions = [convert_pydantic_to_openai_function(Jokes)]
chain = prompt | model.bind(functions=openai_functions) | parser
```

```python
chain.invoke({"input": "tell me two jokes"})
```

```output
[{'setup': "Why don't scientists trust atoms?",
  'punchline': 'Because they make up everything!'},
 {'setup': 'Why did the scarecrow win an award?',
  'punchline': 'Because he was outstanding in his field!'}]
```

```python
for s in chain.stream({"input": "tell me two jokes"}):
    print(s)
```

```output
[]
[{}]
[{'setup': ''}]
[{'setup': 'Why'}]
[{'setup': 'Why don'}]
[{'setup': "Why don't"}]
[{'setup': "Why don't scientists"}]
[{'setup': "Why don't scientists trust"}]
[{'setup': "Why don't scientists trust atoms"}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': ''}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': ''}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scare'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': ''}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because he'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because he was'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because he was outstanding'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because he was outstanding in'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because he was outstanding in his'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because he was outstanding in his field'}]
[{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}, {'setup': 'Why did the scarecrow win an award?', 'punchline': 'Because he was outstanding in his field!'}]
```

## PydanticOutputFunctionsParser

이는 `JsonOutputFunctionsParser`를 기반으로 하지만 결과를 Pydantic 모델로 전달합니다. 이를 통해 추가 검증을 수행할 수 있습니다.

```python
from langchain.output_parsers.openai_functions import PydanticOutputFunctionsParser
```

```python
class Joke(BaseModel):
    """Joke to tell user."""

    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")

    # You can add custom validation logic easily with Pydantic.
    @validator("setup")
    def question_ends_with_question_mark(cls, field):
        if field[-1] != "?":
            raise ValueError("Badly formed question!")
        return field


parser = PydanticOutputFunctionsParser(pydantic_schema=Joke)
```

```python
openai_functions = [convert_pydantic_to_openai_function(Joke)]
chain = prompt | model.bind(functions=openai_functions) | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
Joke(setup="Why don't scientists trust atoms?", punchline='Because they make up everything!')
```
