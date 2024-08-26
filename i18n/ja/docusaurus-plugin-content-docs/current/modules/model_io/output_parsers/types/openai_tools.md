---
translated: true
---

# OpenAI Tools

これらの出力パーサーは、OpenAIの関数呼び出しAPIレスポンスからツールの呼び出しを抽出します。これは、関数呼び出しをサポートしているモデル、特に最新の `tools` および `tool_choice` パラメーターでのみ使用できます。[関数呼び出し](/docs/modules/model_io/chat/function_calling)について理解しておくことをお勧めします。

出力パーサーには、いくつかの異なるバリアントがあります:

- [JsonOutputToolsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_tools.JsonOutputToolsParser.html#langchain_core.output_parsers.openai_tools.JsonOutputToolsParser): 関数呼び出しの引数をJSONで返します
- [JsonOutputKeyToolsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_tools.JsonOutputKeyToolsParser.html#langchain_core.output_parsers.openai_tools.JsonOutputKeyToolsParser): 関数呼び出しの特定のキーの値をJSONで返します
- [PydanticToolsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_tools.PydanticToolsParser.html#langchain_core.output_parsers.openai_tools.PydanticToolsParser): 関数呼び出しの引数をPydanticモデルで返します

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_openai import ChatOpenAI
```

```python
class Joke(BaseModel):
    """Joke to tell user."""

    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")
```

```python
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0).bind_tools([Joke])
```

```python
model.kwargs["tools"]
```

```output
[{'type': 'function',
  'function': {'name': 'Joke',
   'description': 'Joke to tell user.',
   'parameters': {'type': 'object',
    'properties': {'setup': {'description': 'question to set up a joke',
      'type': 'string'},
     'punchline': {'description': 'answer to resolve the joke',
      'type': 'string'}},
    'required': ['setup', 'punchline']}}}]
```

```python
prompt = ChatPromptTemplate.from_messages(
    [("system", "You are helpful assistant"), ("user", "{input}")]
)
```

## JsonOutputToolsParser

```python
from langchain.output_parsers.openai_tools import JsonOutputToolsParser
```

```python
parser = JsonOutputToolsParser()
```

```python
chain = prompt | model | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
[{'type': 'Joke',
  'args': {'setup': "Why don't scientists trust atoms?",
   'punchline': 'Because they make up everything!'}}]
```

ツールの呼び出しIDを含めるには、`return_id=True`を指定できます:

```python
parser = JsonOutputToolsParser(return_id=True)
chain = prompt | model | parser
chain.invoke({"input": "tell me a joke"})
```

```output
[{'type': 'Joke',
  'args': {'setup': "Why don't scientists trust atoms?",
   'punchline': 'Because they make up everything!'},
  'id': 'call_Isuoh0RTeQzzOKGg5QlQ7UqI'}]
```

## JsonOutputKeyToolsParser

これは、返されたレスポンスから単一のキーを抽出するだけです。単一のツールを渡し、その引数のみが欲しい場合に便利です。

```python
from typing import List

from langchain.output_parsers.openai_tools import JsonOutputKeyToolsParser
```

```python
parser = JsonOutputKeyToolsParser(key_name="Joke")
```

```python
chain = prompt | model | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
[{'setup': "Why don't scientists trust atoms?",
  'punchline': 'Because they make up everything!'}]
```

特定のモデルでは、1回の呼び出しで複数のツール呼び出しが返される可能性があるため、デフォルトでは出力はリストになります。最初のツール呼び出しのみを返したい場合は、`first_tool_only=True`を指定できます。

```python
parser = JsonOutputKeyToolsParser(key_name="Joke", first_tool_only=True)
chain = prompt | model | parser
chain.invoke({"input": "tell me a joke"})
```

```output
{'setup': "Why don't scientists trust atoms?",
 'punchline': 'Because they make up everything!'}
```

## PydanticToolsParser

これは `JsonOutputToolsParser` の上に構築されていますが、結果をPydanticモデルに渡します。これにより、必要に応じて追加の検証を行うことができます。

```python
from langchain.output_parsers.openai_tools import PydanticToolsParser
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


parser = PydanticToolsParser(tools=[Joke])
```

```python
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0).bind_tools([Joke])
chain = prompt | model | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
[Joke(setup="Why don't scientists trust atoms?", punchline='Because they make up everything!')]
```
