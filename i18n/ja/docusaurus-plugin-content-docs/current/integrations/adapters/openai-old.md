---
translated: true
---

# OpenAI アダプター(旧)

**OpenAIライブラリのバージョンが1.0.0未満であることを確認してください。それ以外の場合は、新しいドキュメント[OpenAI アダプター](/docs/integrations/adapters/openai/)を参照してください。**

多くの人がOpenAIを使い始めますが、他のモデルも探索したいと思っています。LangChainは多くのモデルプロバイダーとの統合を提供しており、これを簡単に行うことができます。LangChainには独自のメッセージとモデルのAPIがありますが、OpenAIのAPIに適応するアダプターを公開することで、他のモデルを簡単に探索できるようにしています。

現時点では出力のみを扱っており、トークン数、停止理由などの他の情報は返しません。

```python
import openai
from langchain_community.adapters import openai as lc_openai
```

## ChatCompletion.create

```python
messages = [{"role": "user", "content": "hi"}]
```

オリジナルのOpenAIコール

```python
result = openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)
result["choices"][0]["message"].to_dict_recursive()
```

```output
{'role': 'assistant', 'content': 'Hello! How can I assist you today?'}
```

LangChainのOpenAIラッパーコール

```python
lc_result = lc_openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)
lc_result["choices"][0]["message"]
```

```output
{'role': 'assistant', 'content': 'Hello! How can I assist you today?'}
```

モデルプロバイダーの切り替え

```python
lc_result = lc_openai.ChatCompletion.create(
    messages=messages, model="claude-2", temperature=0, provider="ChatAnthropic"
)
lc_result["choices"][0]["message"]
```

```output
{'role': 'assistant', 'content': ' Hello!'}
```

## ChatCompletion.stream

オリジナルのOpenAIコール

```python
for c in openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0, stream=True
):
    print(c["choices"][0]["delta"].to_dict_recursive())
```

```output
{'role': 'assistant', 'content': ''}
{'content': 'Hello'}
{'content': '!'}
{'content': ' How'}
{'content': ' can'}
{'content': ' I'}
{'content': ' assist'}
{'content': ' you'}
{'content': ' today'}
{'content': '?'}
{}
```

LangChainのOpenAIラッパーコール

```python
for c in lc_openai.ChatCompletion.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0, stream=True
):
    print(c["choices"][0]["delta"])
```

```output
{'role': 'assistant', 'content': ''}
{'content': 'Hello'}
{'content': '!'}
{'content': ' How'}
{'content': ' can'}
{'content': ' I'}
{'content': ' assist'}
{'content': ' you'}
{'content': ' today'}
{'content': '?'}
{}
```

モデルプロバイダーの切り替え

```python
for c in lc_openai.ChatCompletion.create(
    messages=messages,
    model="claude-2",
    temperature=0,
    stream=True,
    provider="ChatAnthropic",
):
    print(c["choices"][0]["delta"])
```

```output
{'role': 'assistant', 'content': ' Hello'}
{'content': '!'}
{}
```
