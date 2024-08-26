---
translated: true
---

# Tigris

> [Tigris](https://tigrisdata.com)は、高性能なベクトル検索アプリケーションの構築を簡素化するために設計された、オープンソースのサーバーレスNoSQL データベースおよび検索プラットフォームです。
> `Tigris`は、複数のツールの管理、運用、同期に関するインフラストラクチャの複雑さを排除し、優れたアプリケーションの構築に集中できるようにします。

このノートブックでは、Tigrisをベクトルストアとして使用する方法を説明します。

**前提条件**
1. OpenAIアカウント。[こちら](https://platform.openai.com/)からアカウントに登録できます。
2. [Tigrisの無料アカウントに登録](https://console.preview.tigrisdata.cloud)してください。Tigrisアカウントに登録したら、`vectordemo`という新しいプロジェクトを作成してください。次に、プロジェクトを作成したリージョンの*Uri*、**clientId**、**clientSecret**を控えておいてください。これらの情報は、プロジェクトの**Application Keys**セクションから取得できます。

まずは依存関係をインストールしましょう:

```python
%pip install --upgrade --quiet  tigrisdb openapi-schema-pydantic langchain-openai tiktoken
```

OpenAIのAPIキーとTigrisの認証情報を環境に読み込みます。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["TIGRIS_PROJECT"] = getpass.getpass("Tigris Project Name:")
os.environ["TIGRIS_CLIENT_ID"] = getpass.getpass("Tigris Client Id:")
os.environ["TIGRIS_CLIENT_SECRET"] = getpass.getpass("Tigris Client Secret:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Tigris
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### Tigrisベクトルストアの初期化

テストデータセットをインポートしましょう:

```python
loader = TextLoader("../../../state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
vector_store = Tigris.from_documents(docs, embeddings, index_name="my_embeddings")
```

### 類似検索

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vector_store.similarity_search(query)
print(found_docs)
```

### スコア付き(ベクトル距離)の類似検索

```python
query = "What did the president say about Ketanji Brown Jackson"
result = vector_store.similarity_search_with_score(query)
for doc, score in result:
    print(f"document={doc}, score={score}")
```
