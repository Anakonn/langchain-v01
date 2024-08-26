---
translated: true
---

# Pydantic 파서

이 출력 파서를 사용하면 사용자가 임의의 Pydantic 모델을 지정하고 해당 스키마에 맞는 출력을 LLM에 쿼리할 수 있습니다.

대규모 언어 모델은 누출 추상화라는 점을 유의하세요! 잘 구성된 JSON을 생성할 수 있는 충분한 용량의 LLM을 사용해야 합니다. OpenAI 제품군에서 DaVinci는 안정적으로 수행할 수 있지만 [Curie](https://wiprotechblogs.medium.com/davinci-vs-curie-a-comparison-between-gpt-3-engines-for-extractive-summarization-b568d4633b3b)의 능력은 크게 떨어집니다.

Pydantic을 사용하여 데이터 모델을 선언하세요. Pydantic의 BaseModel은 Python 데이터 클래스와 유사하지만 실제 타입 검사 및 강제 변환이 가능합니다.

```python
from typing import List

from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
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

    # You can add custom validation logic easily with Pydantic.
    @validator("setup")
    def question_ends_with_question_mark(cls, field):
        if field[-1] != "?":
            raise ValueError("Badly formed question!")
        return field


# And a query intented to prompt a language model to populate the data structure.
joke_query = "Tell me a joke."

# Set up a parser + inject instructions into the prompt template.
parser = PydanticOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": joke_query})
```

```output
Joke(setup="Why don't scientists trust atoms?", punchline='Because they make up everything!')
```

```python
# Here's another example, but with a compound typed field.
class Actor(BaseModel):
    name: str = Field(description="name of an actor")
    film_names: List[str] = Field(description="list of names of films they starred in")


actor_query = "Generate the filmography for a random actor."

parser = PydanticOutputParser(pydantic_object=Actor)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": actor_query})
```

```output
Actor(name='Tom Hanks', film_names=['Forrest Gump', 'Cast Away', 'Saving Private Ryan', 'Toy Story', 'The Green Mile'])
```

[PydanticOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.pydantic.PydanticOutputParser.html#langchain_core.output_parsers.pydantic.PydanticOutputParser)의 API 문서를 확인하세요.
