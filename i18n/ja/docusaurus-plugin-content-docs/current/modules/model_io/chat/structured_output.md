---
sidebar_position: 3
translated: true
---

# 構造化された出力

LLMが構造化された出力を返すことは、しばしば非常に重要です。これは、LLMの出力がダウンストリームのアプリケーションで使用されることが多く、特定の引数が必要とされるためです。LLMが確実に構造化された出力を返すことが必要不可欠です。

これを行うためのいくつかの高レベルの戦略があります:

- プロンプティング: これは、LLMに望ましい形式(JSON、XML)で出力を返すよう(とてもよくお願いして)求めることです。これはすべてのLLMで機能するため便利です。しかし、LLMが正しい形式で出力を返すことを保証するものではありません。
- 関数呼び出し: これは、LLMが単なる補完ではなく、関数呼び出しも生成できるように微調整されている場合に使用されます。LLMが呼び出すことができる関数は、一般的にモデルAPIに追加のパラメーターとして渡されます。関数名と説明はプロンプトの一部として扱われる必要があります(通常はトークン数に含まれ、LLMが何をするかを決定するのに使用されます)。
- ツール呼び出し: 関数呼び出しに似たテクニックですが、LLMが複数の関数を同時に呼び出すことができます。
- JSONモード: これは、LLMがJSONを返すことが保証されている場合に使用されます。

各モデルでは、これらのバリアントがわずかに異なるパラメーターでサポートされる可能性があります。LLMが構造化された出力を返すのを簡単にするために、LangChainモデルに共通のインターフェースを追加しました: `.with_structured_output`。

このメソッドを呼び出し(JSONスキーマまたはPydanticモデルを渡して)、モデルは構造化された出力を取得するために必要なモデルパラメーターと出力パーサーを追加します。これを行う方法は複数ある可能性があります(例えば、関数呼び出しとJSONモード)。使用する方法を設定することができます。

実際の例を見てみましょう!

Pydanticを使って応答スキーマを簡単に構造化します。

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class Joke(BaseModel):
    setup: str = Field(description="The setup of the joke")
    punchline: str = Field(description="The punchline to the joke")
```

## OpenAI

OpenAIは、構造化された出力を取得するためのいくつかの方法を公開しています。

[APIリファレンス](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.with_structured_output)

```python
from langchain_openai import ChatOpenAI
```

#### ツール/関数呼び出し

デフォルトでは、`function_calling`を使用します。

```python
model = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup='Why was the cat sitting on the computer?', punchline='To keep an eye on the mouse!')
```

#### JSONモード

JSONモードもサポートしています。プロンプトで応答するフォーマットを指定する必要があることに注意してください。

```python
structured_llm = model.with_structured_output(Joke, method="json_mode")
```

```python
structured_llm.invoke(
    "Tell me a joke about cats, respond in JSON with `setup` and `punchline` keys"
)
```

```output
Joke(setup='Why was the cat sitting on the computer?', punchline='Because it wanted to keep an eye on the mouse!')
```

## Fireworks

[Fireworks](https://fireworks.ai/)も同様に、一部のモデルで関数呼び出しとJSONモードをサポートしています。

[APIリファレンス](https://api.python.langchain.com/en/latest/chat_models/langchain_fireworks.chat_models.ChatFireworks.html#langchain_fireworks.chat_models.ChatFireworks.with_structured_output)

```python
from langchain_fireworks import ChatFireworks
```

#### ツール/関数呼び出し

デフォルトでは、`function_calling`を使用します。

```python
model = ChatFireworks(model="accounts/fireworks/models/firefunction-v1")
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

#### JSONモード

JSONモードもサポートしています。プロンプトで応答するフォーマットを指定する必要があることに注意してください。

```python
structured_llm = model.with_structured_output(Joke, method="json_mode")
```

```python
structured_llm.invoke(
    "Tell me a joke about dogs, respond in JSON with `setup` and `punchline` keys"
)
```

```output
Joke(setup='Why did the dog sit in the shade?', punchline='To avoid getting burned.')
```

## Mistral

Mistralモデルでも構造化された出力をサポートしていますが、関数呼び出しのみをサポートしています。

[APIリファレンス](https://api.python.langchain.com/en/latest/chat_models/langchain_mistralai.chat_models.ChatMistralAI.html#langchain_mistralai.chat_models.ChatMistralAI.with_structured_output)

```python
from langchain_mistralai import ChatMistralAI
```

```python
model = ChatMistralAI(model="mistral-large-latest")
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

## Together

[TogetherAI](https://www.together.ai/)はOpenAIの代替品なので、OpenAIの統合を使うことができます。

```python
import os

from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI(
    base_url="https://api.together.xyz/v1",
    api_key=os.environ["TOGETHER_API_KEY"],
    model="mistralai/Mixtral-8x7B-Instruct-v0.1",
)
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup='Why did the cat sit on the computer?', punchline='To keep an eye on the mouse!')
```

## Groq

Groqは、OpenAI互換の関数呼び出しAPIを提供しています。

[APIリファレンス](https://api.python.langchain.com/en/latest/chat_models/langchain_groq.chat_models.ChatGroq.html#langchain_groq.chat_models.ChatGroq.with_structured_output)

```python
from langchain_groq import ChatGroq
```

#### ツール/関数呼び出し

デフォルトでは、`function_calling`を使用します。

```python
model = ChatGroq()
structured_llm = model.with_structured_output(Joke)
```

```python
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

#### JSONモード

JSONモードもサポートしています。プロンプトで応答するフォーマットを指定する必要があることに注意してください。

```python
structured_llm = model.with_structured_output(Joke, method="json_mode")
```

```python
structured_llm.invoke(
    "Tell me a joke about cats, respond in JSON with `setup` and `punchline` keys"
)
```

```output
Joke(setup="Why don't cats play poker in the jungle?", punchline='Too many cheetahs!')
```

## Anthropic

Anthropicのツール呼び出しAPIは、出力の構造化に使用できます。APIを介してツール呼び出しを強制する方法はないため、モデルを正しくプロンプトすることが重要です。

[APIリファレンス](https://api.python.langchain.com/en/latest/chat_models/langchain_anthropic.chat_models.ChatAnthropic.html#langchain_anthropic.chat_models.ChatAnthropic.with_structured_output)

```python
from langchain_anthropic import ChatAnthropic

model = ChatAnthropic(model="claude-3-opus-20240229", temperature=0)
structured_llm = model.with_structured_output(Joke)
structured_llm.invoke("Tell me a joke about cats. Make sure to call the Joke function.")
```

```output
Joke(setup='What do you call a cat that loves to bowl?', punchline='An alley cat!')
```

## Google Vertex AI

Google Geminiモデルは[関数呼び出し](https://ai.google.dev/docs/function_calling)をサポートしており、これをVertex AIを介してアクセスし、出力の構造化に使用できます。

[APIリファレンス](https://api.python.langchain.com/en/latest/chat_models/langchain_google_vertexai.chat_models.ChatVertexAI.html#langchain_google_vertexai.chat_models.ChatVertexAI.with_structured_output)

```python
from langchain_google_vertexai import ChatVertexAI

llm = ChatVertexAI(model="gemini-pro", temperature=0)
structured_llm = llm.with_structured_output(Joke)
structured_llm.invoke("Tell me a joke about cats")
```

```output
Joke(setup='Why did the scarecrow win an award?', punchline='Why did the scarecrow win an award? Because he was outstanding in his field.')
```
