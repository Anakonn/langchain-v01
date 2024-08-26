---
translated: true
---

# JSONパーサー

このアウトプットパーサーにより、ユーザーは任意のJSONスキーマを指定し、そのスキーマに準拠したアウトプットをLLMに問い合わせることができます。

大規模言語モデルは漏れ抽象化であることに注意してください! 適切な容量のLLMを使用して、適切に形式化されたJSONを生成する必要があります。 OpenAIファミリーでは、DaVinciが確実に行えますが、Curieの能力は劇的に低下します。

オプションでPydanticを使ってデータモデルを宣言することができます。

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

## ストリーミング

このアウトプットパーサーはストリーミングをサポートしています。

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

## Pydanticなしで

Pydanticを使わずに使うこともできます。これにより、JSONを返すよう促しますが、スキーマについての具体的な情報は提供されません。

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

[JsonOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.json.JsonOutputParser.html#langchain_core.output_parsers.json.JsonOutputParser)のAPIドキュメントを確認してください。
