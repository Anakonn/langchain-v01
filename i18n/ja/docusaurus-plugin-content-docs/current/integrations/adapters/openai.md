---
translated: true
---

# OpenAI アダプター

**OpenAI ライブラリのバージョンが 1.0.0 以上であることを確認してください。それ以前のバージョンの場合は、古いドキュメント [OpenAI アダプター(旧)](/docs/integrations/adapters/openai-old/) を参照してください。**

多くの人がOpenAIを使い始めますが、他のモデルも探索したいと思っています。LangChainは多くのモデルプロバイダーとの統合を提供しており、これを簡単に行うことができます。LangChainには独自のメッセージとモデルのAPIがありますが、OpenAIのAPIに適応するアダプターを公開することで、他のモデルを簡単に探索できるようにしました。

現時点では出力のみを扱っており、トークン数、停止理由などの他の情報は返しません。

```python
import openai
from langchain_community.adapters import openai as lc_openai
```

## chat.completions.create

```python
messages = [{"role": "user", "content": "hi"}]
```

オリジナルのOpenAI呼び出し

```python
result = openai.chat.completions.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)
result.choices[0].message.model_dump()
```

```output
{'content': 'Hello! How can I assist you today?',
 'role': 'assistant',
 'function_call': None,
 'tool_calls': None}
```

LangChain OpenAIラッパー呼び出し

```python
lc_result = lc_openai.chat.completions.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0
)

lc_result.choices[0].message  # Attribute access
```

```output
{'role': 'assistant', 'content': 'Hello! How can I help you today?'}
```

```python
lc_result["choices"][0]["message"]  # Also compatible with index access
```

```output
{'role': 'assistant', 'content': 'Hello! How can I help you today?'}
```

モデルプロバイダーの切り替え

```python
lc_result = lc_openai.chat.completions.create(
    messages=messages, model="claude-2", temperature=0, provider="ChatAnthropic"
)
lc_result.choices[0].message
```

```output
{'role': 'assistant', 'content': 'Hello! How can I assist you today?'}
```

## chat.completions.stream

オリジナルのOpenAI呼び出し

```python
for c in openai.chat.completions.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0, stream=True
):
    print(c.choices[0].delta.model_dump())
```

```output
{'content': '', 'function_call': None, 'role': 'assistant', 'tool_calls': None}
{'content': 'Hello', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': '!', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' How', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' can', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' I', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' assist', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' you', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': ' today', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': '?', 'function_call': None, 'role': None, 'tool_calls': None}
{'content': None, 'function_call': None, 'role': None, 'tool_calls': None}
```

LangChain OpenAIラッパー呼び出し

```python
for c in lc_openai.chat.completions.create(
    messages=messages, model="gpt-3.5-turbo", temperature=0, stream=True
):
    print(c.choices[0].delta)
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
for c in lc_openai.chat.completions.create(
    messages=messages,
    model="claude-2",
    temperature=0,
    stream=True,
    provider="ChatAnthropic",
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
