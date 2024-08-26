---
translated: true
---

# Cohere

>[Cohere](https://cohere.ai/about)は、企業のヒト-マシン間のインタラクションを改善するための自然言語処理モデルを提供するカナダのスタートアップです。

[API reference](https://api.python.langchain.com/en/latest/llms/langchain_community.llms.cohere.Cohere.html)で、すべての属性とメソッドの詳細なドキュメントを確認してください。

## セットアップ

このインテグレーションは `langchain-community` パッケージに含まれています。また、`cohere` パッケージ自体もインストールする必要があります。これらは以下でインストールできます:

```bash
pip install -U langchain-community langchain-cohere
```

[Cohere API key](https://cohere.com/)を取得し、`COHERE_API_KEY`環境変数を設定する必要があります:

```python
import getpass
import os

os.environ["COHERE_API_KEY"] = getpass.getpass()
```

```output
 ········
```

[LangSmith](https://smith.langchain.com/)を設定すると、最高レベルの可視化が得られるので便利です(必須ではありません)。

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 使用方法

Cohereは、すべての[LLM](/docs/modules/model_io/llms/)機能をサポートしています:

```python
from langchain_cohere import Cohere
from langchain_core.messages import HumanMessage
```

```python
model = Cohere(model="command", max_tokens=256, temperature=0.75)
```

```python
message = "Knock knock"
model.invoke(message)
```

```output
" Who's there?"
```

```python
await model.ainvoke(message)
```

```output
" Who's there?"
```

```python
for chunk in model.stream(message):
    print(chunk, end="", flush=True)
```

```output
 Who's there?
```

```python
model.batch([message])
```

```output
[" Who's there?"]
```

また、ユーザー入力を簡単に構造化するために、プロンプトテンプレートと組み合わせることもできます。これは[LCEL](/docs/expression_language)を使って行えます。

```python
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("Tell me a joke about {topic}")
chain = prompt | model
```

```python
chain.invoke({"topic": "bears"})
```

```output
' Why did the teddy bear cross the road?\nBecause he had bear crossings.\n\nWould you like to hear another joke? '
```
