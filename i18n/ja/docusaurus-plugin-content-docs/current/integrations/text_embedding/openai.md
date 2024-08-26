---
translated: true
---

# OpenAI

OpenAIの埋め込みクラスをロードしましょう。

## セットアップ

まず、langchain-openaiをインストールし、必要な環境変数を設定します。

```python
%pip install -qU langchain-openai
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

```python
from langchain_openai import OpenAIEmbeddings
```

```python
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
```

```python
text = "This is a test document."
```

## 使用方法

### クエリの埋め込み

```python
query_result = embeddings.embed_query(text)
```

```output
Warning: model not found. Using cl100k_base encoding.
```

```python
query_result[:5]
```

```output
[-0.014380056377383358,
 -0.027191711627651764,
 -0.020042716111860304,
 0.057301379620345545,
 -0.022267658631828974]
```

## ドキュメントの埋め込み

```python
doc_result = embeddings.embed_documents([text])
```

```output
Warning: model not found. Using cl100k_base encoding.
```

```python
doc_result[0][:5]
```

```output
[-0.014380056377383358,
 -0.027191711627651764,
 -0.020042716111860304,
 0.057301379620345545,
 -0.022267658631828974]
```

## 次元の指定

`text-embedding-3`クラスのモデルでは、返される埋め込みのサイズを指定できます。例えば、デフォルトでは`text-embedding-3-large`は3072次元の埋め込みを返します:

```python
len(doc_result[0])
```

```output
3072
```

しかし、`dimensions=1024`を渡すことで、埋め込みのサイズを1024次元に減らすことができます:

```python
embeddings_1024 = OpenAIEmbeddings(model="text-embedding-3-large", dimensions=1024)
```

```python
len(embeddings_1024.embed_documents([text])[0])
```

```output
Warning: model not found. Using cl100k_base encoding.
```

```output
1024
```
