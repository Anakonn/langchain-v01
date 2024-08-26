---
translated: true
---

# JSON 파서

이 출력 파서를 사용하면 사용자가 임의의 JSON 스키마를 지정하고 해당 스키마에 맞는 출력을 LLM에 쿼리할 수 있습니다.

대규모 언어 모델은 누출 추상화라는 점을 유의하세요! 잘 구성된 JSON을 생성하려면 충분한 용량의 LLM을 사용해야 합니다. OpenAI 제품군에서 DaVinci는 신뢰할 수 있지만 Curie의 능력은 크게 떨어집니다.

선택적으로 Pydantic을 사용하여 데이터 모델을 선언할 수 있습니다.

```python
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI(temperature=0)
```

```python
# Define your desired data structure.
class Joke(BaseModel):
    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")
```

```python
# And a query intented to prompt a language model to populate the data structure.
joke_query = "Tell me a joke."

# Set up a parser + inject instructions into the prompt template.
parser = JsonOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": joke_query})
```

```output
{'setup': "Why don't scientists trust atoms?",
 'punchline': 'Because they make up everything!'}
```

## 스트리밍

이 출력 파서는 스트리밍을 지원합니다.

```python
for s in chain.stream({"query": joke_query}):
    print(s)
```

```output
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

## Pydantic 없이

Pydantic 없이도 이 기능을 사용할 수 있습니다. 이렇게 하면 JSON을 반환하도록 프롬프트하지만 스키마에 대한 구체적인 정보는 제공하지 않습니다.

```python
joke_query = "Tell me a joke."

parser = JsonOutputParser()

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": joke_query})
```

```output
{'joke': "Why don't scientists trust atoms? Because they make up everything!"}
```

[JsonOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.json.JsonOutputParser.html#langchain_core.output_parsers.json.JsonOutputParser)의 API 문서를 확인하세요.
