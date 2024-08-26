---
sidebar_position: 0
translated: true
---

# ベクトルストア対応リトリーバー

ベクトルストアリトリーバーは、ベクトルストアを使ってドキュメントを取得するリトリーバーです。リトリーバーインターフェースに準拠するためのベクトルストアクラスの軽量なラッパーです。
類似検索やMMRなどのベクトルストアの検索メソッドを使って、ベクトルストア内のテキストを検索します。

ベクトルストアを構築したら、リトリーバーを構築するのはとても簡単です。例を見ていきましょう。

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../state_of_the_union.txt")
```

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(texts, embeddings)
```

```python
retriever = db.as_retriever()
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
```

## 最大限の周辺関連性検索

デフォルトでは、ベクトルストアリトリーバーは類似検索を使います。ベクトルストアが最大限の周辺関連性検索をサポートしている場合は、検索タイプをそれに指定できます。

```python
retriever = db.as_retriever(search_type="mmr")
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
```

## 類似スコアしきい値検索

類似スコアのしきい値を設定し、そのスコア以上のドキュメントのみを返す検索方法も使えます。

```python
retriever = db.as_retriever(
    search_type="similarity_score_threshold", search_kwargs={"score_threshold": 0.5}
)
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
```

## 上位k件の指定

`k`などの検索パラメータを指定して、取得するドキュメントの件数を制限することもできます。

```python
retriever = db.as_retriever(search_kwargs={"k": 1})
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
len(docs)
```

```output
1
```
