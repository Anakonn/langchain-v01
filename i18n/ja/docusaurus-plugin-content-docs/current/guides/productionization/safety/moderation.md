---
translated: true
---

# 監視チェーン

このノートブックでは、監視チェーンの使用例と、一般的な使用方法について説明します。
監視チェーンは、憎しみや暴力的な内容を検出するのに役立ちます。これは、ユーザーの入力だけでなく、言語モデルの出力にも適用できます。
一部のAPIプロバイダーは、ユーザーや最終ユーザーが特定の有害な内容を生成することを明示的に禁止しています。これに準拠し(そして一般的に自分のアプリケーションが有害にならないようにするため)、シーケンスに監視チェーンを追加して、LLMが生成する出力が有害でないことを確認することをお勧めします。

監視チェーンに渡されたコンテンツが有害である場合、最善の対処方法はありません。
これはアプリケーションによって異なります。エラーを発生させ(アプリケーションがそれを処理するようにする)、または、テキストが有害であることを説明するものを返すこともあります。

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain.chains import OpenAIModerationChain
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import OpenAI
```

```python
moderate = OpenAIModerationChain()
```

```python
model = OpenAI()
prompt = ChatPromptTemplate.from_messages([("system", "repeat after me: {input}")])
```

```python
chain = prompt | model
```

```python
chain.invoke({"input": "you are stupid"})
```

```output
'\n\nYou are stupid.'
```

```python
moderated_chain = chain | moderate
```

```python
moderated_chain.invoke({"input": "you are stupid"})
```

```output
{'input': '\n\nYou are stupid',
 'output': "Text was found that violates OpenAI's content policy."}
```
