---
translated: true
---

# YAML 파서

이 출력 파서를 사용하면 사용자가 임의의 스키마를 지정하고 YAML을 사용하여 응답을 형식화하여 해당 스키마에 부합하는 출력을 LLM에 쿼리할 수 있습니다.

대규모 언어 모델은 누출 추상화라는 점을 명심하세요! 잘 구성된 YAML을 생성할 수 있는 충분한 용량의 LLM을 사용해야 합니다. OpenAI 제품군에서 DaVinci는 신뢰할 수 있지만 Curie의 능력은 이미 크게 떨어집니다.

선택적으로 Pydantic을 사용하여 데이터 모델을 선언할 수 있습니다.

```python
from typing import List

from langchain.output_parsers import YamlOutputParser
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
parser = YamlOutputParser(pydantic_object=Joke)

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

[YamlOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.yaml.YamlOutputParser.html#langchain.output_parsers.yaml.YamlOutputParser)의 API 문서를 확인하세요.
