---
translated: true
---

# MistralAI

このノートブックでは、langchain_mistralaiパッケージに含まれるMistralAIEmbeddingsを使ってtextをembedする方法を説明します。

```python
# pip install -U langchain-mistralai
```

## ライブラリをインポートする

```python
from langchain_mistralai import MistralAIEmbeddings
```

```python
embedding = MistralAIEmbeddings(api_key="your-api-key")
```

# Embedding Modelの使用

`MistralAIEmbeddings`を使うと、デフォルトモデル'mistral-embed'を直接使うことができます。または、利用可能な別のモデルを設定することもできます。

```python
embedding.model = "mistral-embed"  # or your preferred model if available
```

```python
res_query = embedding.embed_query("The test information")
res_document = embedding.embed_documents(["test1", "another test"])
```
