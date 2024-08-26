---
translated: true
---

# Together AI

[Together AI](https://www.together.ai/)は、数行のコードで[50以上の主要なオープンソースモデル](https://docs.together.ai/docs/inference-models)にクエリを実行できるAPIを提供しています。

この例では、LangChainを使ってTogether AIモデルと対話する方法を説明します。

## インストール

```python
%pip install --upgrade langchain-together
```

## 環境

Together AIを使用するには、APIキーが必要です。APIキーは次の場所で確認できます:
https://api.together.ai/settings/api-keys。これは``together_api_key``の初期化パラメーターとして渡すことができ、または``TOGETHER_API_KEY``の環境変数として設定することができます。

## 例

```python
# Querying chat models with Together AI

from langchain_together import ChatTogether

# choose from our 50+ models here: https://docs.together.ai/docs/inference-models
chat = ChatTogether(
    # together_api_key="YOUR_API_KEY",
    model="meta-llama/Llama-3-70b-chat-hf",
)

# stream the response back from the model
for m in chat.stream("Tell me fun things to do in NYC"):
    print(m.content, end="", flush=True)

# if you don't want to do streaming, you can use the invoke method
# chat.invoke("Tell me fun things to do in NYC")
```

```python
# Querying code and language models with Together AI

from langchain_together import Together

llm = Together(
    model="codellama/CodeLlama-70b-Python-hf",
    # together_api_key="..."
)

print(llm.invoke("def bubble_sort(): "))
```
