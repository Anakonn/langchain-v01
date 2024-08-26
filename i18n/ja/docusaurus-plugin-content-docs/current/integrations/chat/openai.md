---
sidebar_label: OpenAI
translated: true
---

# ChatOpenAI

このノートブックでは、OpenAIのチャットモデルの使い始め方を説明します。

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
```

```python
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

上のセルでは、OpenAIのAPIキーが環境変数に設定されていることを前提としています。APIキーや組織IDを手動で指定したい場合は、以下のコードを使用してください:

```python
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0, api_key="YOUR_API_KEY", openai_organization="YOUR_ORGANIZATION_ID")
```

組織IDが適用されない場合は、openai_organizationパラメーターを削除してください。

```python
messages = [
    ("system", "You are a helpful assistant that translates English to French."),
    ("human", "Translate this sentence from English to French. I love programming."),
]
llm.invoke(messages)
```

```output
AIMessage(content="J'adore programmer.", response_metadata={'token_usage': {'completion_tokens': 6, 'prompt_tokens': 34, 'total_tokens': 40}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'stop', 'logprobs': None}, id='run-8591eae1-b42b-402b-a23a-dfdb0cd151bd-0')
```

## チェイニング

プロンプトテンプレートとモデルをチェインさせることができます:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant that translates {input_language} to {output_language}.",
        ),
        ("human", "{input}"),
    ]
)

chain = prompt | llm
chain.invoke(
    {
        "input_language": "English",
        "output_language": "German",
        "input": "I love programming.",
    }
)
```

```output
AIMessage(content='Ich liebe Programmieren.', response_metadata={'token_usage': {'completion_tokens': 5, 'prompt_tokens': 26, 'total_tokens': 31}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'stop', 'logprobs': None}, id='run-94fa6741-c99b-4513-afce-c3f562631c79-0')
```

## ツールの呼び出し

OpenAIには[ツールの呼び出し](https://platform.openai.com/docs/guides/function-calling)（"ツールの呼び出し"と"関数の呼び出し"は互換的に使用されます）APIがあり、ツールとその引数を記述することで、モデルがツールを呼び出すためのJSONオブジェクトを返すことができます。ツールの呼び出しは、ツールを使用するチェーンやエージェントを構築したり、より構造化された出力を得るのに非常に便利です。

### ChatOpenAI.bind_tools()

`ChatAnthropic.bind_tools`を使うと、Pydanticクラス、dictスキーマ、LangChainツール、あるいは関数をツールとしてモデルに簡単に渡すことができます。内部的にはこれらがAnthropic ツールスキーマに変換され、すべてのモデル呼び出しに渡されます。

```output
{
    "name": "...",
    "description": "...",
    "parameters": {...}  # JSONSchema
}
```

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class GetWeather(BaseModel):
    """Get the current weather in a given location"""

    location: str = Field(..., description="The city and state, e.g. San Francisco, CA")


llm_with_tools = llm.bind_tools([GetWeather])
```

```python
ai_msg = llm_with_tools.invoke(
    "what is the weather like in San Francisco",
)
ai_msg
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_H7fABDuzEau48T10Qn0Lsh0D', 'function': {'arguments': '{"location":"San Francisco"}', 'name': 'GetWeather'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 15, 'prompt_tokens': 70, 'total_tokens': 85}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_b28b39ffa8', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-b469135e-2718-446a-8164-eef37e672ba2-0', tool_calls=[{'name': 'GetWeather', 'args': {'location': 'San Francisco'}, 'id': 'call_H7fABDuzEau48T10Qn0Lsh0D'}])
```

### AIMessage.tool_calls

AIMessageには`tool_calls`属性があることに注目してください。ここにはモデルプロバイダー非依存の標準的なToolCall形式で、ツールの呼び出し情報が含まれています。

```python
ai_msg.tool_calls
```

```output
[{'name': 'GetWeather',
  'args': {'location': 'San Francisco'},
  'id': 'call_H7fABDuzEau48T10Qn0Lsh0D'}]
```

ツールのバインディングとツールの呼び出し出力の詳細については、[ツールの呼び出し](/docs/modules/model_io/chat/function_calling/)のドキュメントをご覧ください。

## ファインチューニング

`modelName`パラメーターにファインチューニングされたOpenAIモデルを指定することで、それらを呼び出すことができます。

一般的な形式は `ft:{OPENAI_MODEL_NAME}:{ORG_NAME}::{MODEL_ID}` です。例えば:

```python
fine_tuned_model = ChatOpenAI(
    temperature=0, model_name="ft:gpt-3.5-turbo-0613:langchain::7qTVM5AR"
)

fine_tuned_model(messages)
```

```output
AIMessage(content="J'adore la programmation.", additional_kwargs={}, example=False)
```
