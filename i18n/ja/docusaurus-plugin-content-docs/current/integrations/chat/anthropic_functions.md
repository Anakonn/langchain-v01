---
sidebar_class_name: hidden
translated: true
---

# [非推奨] Anthropic Tools Wrapperの実験的な使用

::: {.callout-warning}

Anthropic APIは公式にツールの呼び出しをサポートしているため、この回避策は不要になりました。[ChatAnthropic](/docs/integrations/chat/anthropic)を`langchain-anthropic>=0.1.5`と共に使用してください。

:::

このノートブックでは、Anthropicにツールの呼び出しと構造化された出力機能を提供する実験的なラッパーの使用方法を示します。Anthropicのガイド[こちら](https://docs.anthropic.com/claude/docs/functions-external-tools)に従っています。

このラッパーは`langchain-anthropic`パッケージから利用可能で、LLMからのXML出力を解析するために`defusedxml`の任意の依存関係も必要です。

注意: これはベータ機能であり、Anthropicの正式なツール呼び出しの実装によって置き換えられますが、テストや実験に役立ちます。

```python
%pip install -qU langchain-anthropic defusedxml
from langchain_anthropic.experimental import ChatAnthropicTools
```

## ツールのバインディング

`ChatAnthropicTools`は`bind_tools`メソッドを公開しており、PydanticモデルやBaseToolsをLLMに渡すことができます。

```python
from langchain_core.pydantic_v1 import BaseModel


class Person(BaseModel):
    name: str
    age: int


model = ChatAnthropicTools(model="claude-3-opus-20240229").bind_tools(tools=[Person])
model.invoke("I am a 27 year old named Erick")
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'function': {'name': 'Person', 'arguments': '{"name": "Erick", "age": "27"}'}, 'type': 'function'}]})
```

## 構造化された出力

`ChatAnthropicTools`は、値を抽出するための[`with_structured_output`仕様](/docs/modules/model_io/chat/structured_output)も実装しています。注意: これはツールの呼び出しを明示的に提供するモデルほど安定しない可能性があります。

```python
chain = ChatAnthropicTools(model="claude-3-opus-20240229").with_structured_output(
    Person
)
chain.invoke("I am a 27 year old named Erick")
```

```output
Person(name='Erick', age=27)
```
