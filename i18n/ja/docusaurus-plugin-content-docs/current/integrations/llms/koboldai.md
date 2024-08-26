---
translated: true
---

# KoboldAI API

[KoboldAI](https://github.com/KoboldAI/KoboldAI-Client)は"複数のローカル&リモートAIモデルを使ったAI支援ライティングのためのブラウザベースのフロントエンド..."です。LangChainで使用できるパブリックおよびローカルAPIがあります。

この例では、そのAPIをLangChainで使用する方法について説明します。

ドキュメンテーションは、エンドポイントの末尾に/apiを追加したブラウザ(例: http://127.0.0.1/:5000/api)で確認できます。

```python
from langchain_community.llms import KoboldApiLLM
```

下に表示されているエンドポイントを、--apiまたは--public-apiでWebUIを起動した後に表示されるエンドポイントに置き換えてください。

オプションで、temperatureやmax_lengthのようなパラメーターを渡すこともできます。

```python
llm = KoboldApiLLM(endpoint="http://192.168.1.144:5000", max_length=80)
```

```python
response = llm.invoke(
    "### Instruction:\nWhat is the first book of the bible?\n### Response:"
)
```
