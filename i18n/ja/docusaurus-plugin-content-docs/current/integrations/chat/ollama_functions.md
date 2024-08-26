---
sidebar_label: Ollamaの機能
translated: true
---

# Ollamaの機能

このノートブックでは、Ollamaに対する実験的なラッパーを使用する方法を示します。このラッパーにより、Ollamaは OpenAI Functions と同じAPIを持つことができます。

複雑なスキーマや複数の関数を使用する場合は、より強力で機能的なモデルの方が良いパフォーマンスを発揮します。以下の例では、llama3 and phi3 モデルを使用しています。
サポートされているモデルとモデルのバリエーションの完全なリストは、[Ollamaモデルライブラリ](https://ollama.ai/library)を参照してください。

## セットアップ

ローカルのOllamaインスタンスを設定して実行するには、[これらの手順](https://github.com/jmorganca/ollama)に従ってください。

## 使用方法

OllamaFunctionsは、標準のChatOllamaインスタンスを初期化するのと同様の方法で初期化できます:

```python
from langchain_experimental.llms.ollama_functions import OllamaFunctions

model = OllamaFunctions(model="llama3", format="json")
```

次に、JSON Schemaパラメーターと `function_call` パラメーターで定義された関数をバインドできます。これにより、モデルに指定された関数を呼び出すよう強制できます:

```python
model = model.bind_tools(
    tools=[
        {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, " "e.g. San Francisco, CA",
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                    },
                },
                "required": ["location"],
            },
        }
    ],
    function_call={"name": "get_current_weather"},
)
```

この方法で関数を呼び出すと、提供されたスキーマに一致するJSONの出力が得られます:

```python
from langchain_core.messages import HumanMessage

model.invoke("what is the weather in Boston?")
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'get_current_weather', 'arguments': '{"location": "Boston, MA"}'}}, id='run-1791f9fe-95ad-4ca4-bdf7-9f73eab31e6f-0')
```

## 構造化された出力

`with_structured_output()` 関数を使用して関数呼び出しを行うと、入力から特性を抽出する際に便利です:

```python
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field


# Schema for structured response
class Person(BaseModel):
    name: str = Field(description="The person's name", required=True)
    height: float = Field(description="The person's height", required=True)
    hair_color: str = Field(description="The person's hair color")


# Prompt template
prompt = PromptTemplate.from_template(
    """Alex is 5 feet tall.
Claudia is 1 feet taller than Alex and jumps higher than him.
Claudia is a brunette and Alex is blonde.

Human: {question}
AI: """
)

# Chain
llm = OllamaFunctions(model="phi3", format="json", temperature=0)
structured_llm = llm.with_structured_output(Person)
chain = prompt | structured_llm
```

### Alexに関するデータの抽出

```python
alex = chain.invoke("Describe Alex")
alex
```

```output
Person(name='Alex', height=5.0, hair_color='blonde')
```

### Claudiaに関するデータの抽出

```python
claudia = chain.invoke("Describe Claudia")
claudia
```

```output
Person(name='Claudia', height=6.0, hair_color='brunette')
```
