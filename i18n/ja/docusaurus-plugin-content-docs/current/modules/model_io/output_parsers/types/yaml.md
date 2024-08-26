---
translated: true
---

# YAMLパーサー

このアウトプットパーサーにより、ユーザーは任意のスキーマを指定し、YAMLを使ってそのスキーマに準拠したアウトプットをLLMに問い合わせることができます。

大規模言語モデルは漏れ抜けた抽象化であることに注意してください! 適切な容量のLLMを使用して、整形式のYAMLを生成する必要があります。OpenAIファミリーでは、DaVinciが確実に行えますが、Curieの能力は劇的に低下します。

オプションでPydanticを使ってデータモデルを宣言することができます。

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

[YamlOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.yaml.YamlOutputParser.html#langchain.output_parsers.yaml.YamlOutputParser)のAPIドキュメントを確認してください。
