---
translated: true
---

# Momento Vector Index (MVI)

>[MVI](https://gomomento.com): 最も生産的で使いやすい、サーバーレスのベクトルインデックスです。MVI を使い始めるには、アカウントに登録するだけです。インフラの管理、サーバーの管理、スケーリングの心配をする必要はありません。MVI は、ニーズに合わせて自動的にスケールするサービスです。

MVI にサインアップしてアクセスするには、[Momento Console](https://console.gomomento.com)にアクセスしてください。

# セットアップ

## 前提条件のインストール

以下が必要です:
- MVI と対話するための [`momento`](https://pypi.org/project/momento/) パッケージ
- OpenAI API と対話するための openai パッケージ
- テキストをトークン化するための tiktoken パッケージ

```python
%pip install --upgrade --quiet  momento langchain-openai tiktoken
```

## API キーの入力

```python
import getpass
import os
```

### Momento: データのインデックス化

[Momento Console](https://console.gomomento.com) にアクセスして API キーを取得してください。

```python
os.environ["MOMENTO_API_KEY"] = getpass.getpass("Momento API Key:")
```

### OpenAI: テキストの埋め込み

```python
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

# データのロード

ここでは Langchain の例データセット、State of the Union アドレスを使用します。

まず関連モジュールをロードします:

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import MomentoVectorIndex
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

次にデータをロードします:

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
len(documents)
```

```output
1
```

データは 1 つの大きなファイルであるため、ドキュメントは 1 つだけです:

```python
len(documents[0].page_content)
```

```output
38539
```

この 1 つの大きなテキストファイルを、質問応答のためにチャンクに分割します。これにより、ユーザーの質問に最も関連性の高いチャンクから回答できます。

```python
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
len(docs)
```

```output
42
```

# データのインデックス化

データのインデックス化は、`MomentoVectorIndex` オブジェクトをインスタンス化するだけです。ここでは `from_documents` ヘルパーを使って、インスタンス化とインデックス化を同時に行います:

```python
vector_db = MomentoVectorIndex.from_documents(
    docs, OpenAIEmbeddings(), index_name="sotu"
)
```

これにより、API キーを使って Momento Vector Index サービスに接続し、データをインデックス化します。インデックスがまだ存在していない場合は、新しく作成されます。データは検索可能になりました。

# データの検索

## インデックスに直接クエリを投げる

データを検索する最も直接的な方法は、インデックスに対してクエリを投げることです。以下のように `VectorStore` API を使って行えます:

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
```

```python
docs[0].page_content
```

```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```

この結果には Ketanji Brown Jackson に関する関連情報が含まれていますが、簡潔で人間が読みやすい回答ではありません。次のセクションでその対策を行います。

## LLM を使って流暢な回答を生成する

MVI にデータをインデックス化したので、ベクトル類似検索を活用するチェーンと統合できます。ここでは `RetrievalQA` チェーンを使って、インデックス化されたデータから質問に回答する方法を示します。

まず関連モジュールをロードします:

```python
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI
```

次に retrieval QA チェーンをインスタンス化します:

```python
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
qa_chain = RetrievalQA.from_chain_type(llm, retriever=vector_db.as_retriever())
```

```python
qa_chain({"query": "What did the president say about Ketanji Brown Jackson?"})
```

```output
{'query': 'What did the president say about Ketanji Brown Jackson?',
 'result': "The President said that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court. He described her as one of the nation's top legal minds and mentioned that she has received broad support from various groups, including the Fraternal Order of Police and former judges appointed by Democrats and Republicans."}
```

# 次のステップ

以上で、データをインデックス化し、Momento Vector Index を使ってクエリできるようになりました。ベクトル類似検索をサポートするチェーンであれば、同じインデックスを使ってデータをクエリできます。

Momento を使えば、ベクトルデータのインデックス化だけでなく、API コールのキャッシュやチャットメッセージ履歴の保存も行えます。Momento の他の Langchain インテグレーションについても確認してください。

Momento Vector Index の詳細については、[Momento ドキュメンテーション](https://docs.gomomento.com)をご覧ください。
