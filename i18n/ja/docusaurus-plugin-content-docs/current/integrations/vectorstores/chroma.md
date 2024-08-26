---
translated: true
---

# Chroma

>[Chroma](https://docs.trychroma.com/getting-started)は、開発者の生産性とハッピネスに焦点を当てたAI原生のオープンソースのベクトルデータベースです。Chromaは Apache 2.0 ライセンスの下で提供されています。

Chromaをインストールするには:

```sh
pip install langchain-chroma
```

Chromaは様々なモードで動作します。LangChainとの統合例を以下に示します。
- `in-memory` - PythonスクリプトまたはJupyter Notebookで
- `in-memory with persistance` - スクリプトまたはノートブックで、ディスクに保存/読み込み
- `in a docker container` - ローカルマシンまたはクラウドでサーバーとして実行

他のデータベースと同様に、以下のメソッドを使用できます:
- `.add`
- `.get`
- `.update`
- `.upsert`
- `.delete`
- `.peek`
- `.query` は類似性検索を実行します。

完全なドキュメントは[docs](https://docs.trychroma.com/reference/Collection)で確認できます。これらのメソッドに直接アクセスするには、`._collection.method()`を使用できます。

## 基本的な例

この基本的な例では、最新の一般教書演説を取り、それをチャンクに分割し、オープンソースの埋め込みモデルを使ってエンベディングし、Chromaにロードし、クエリを実行します。

```python
# import
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
from langchain_text_splitters import CharacterTextSplitter

# load the document and split it into chunks
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()

# split it into chunks
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

# create the open-source embedding function
embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

# load it into Chroma
db = Chroma.from_documents(docs, embedding_function)

# query it
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)

# print results
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## 基本的な例 (ディスクへの保存を含む)

前の例を拡張して、ディスクに保存したい場合は、Chromaクライアントを初期化し、データを保存したいディレクトリを渡すだけです。

`注意`: Chromaは自動的にデータをディスクに保存するよう最善を尽くしますが、複数のin-memoryクライアントが互いの作業を妨げる可能性があります。最良の方法は、任意の時点で1つのクライアントのみをパスで実行することです。

```python
# save to disk
db2 = Chroma.from_documents(docs, embedding_function, persist_directory="./chroma_db")
docs = db2.similarity_search(query)

# load from disk
db3 = Chroma(persist_directory="./chroma_db", embedding_function=embedding_function)
docs = db3.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## LangChainにChromaクライアントを渡す

Chromaクライアントを作成し、LangChainに渡すこともできます。これは、基礎となるデータベースにより簡単にアクセスしたい場合に特に便利です。

また、LangChainが使用するコレクション名を指定することもできます。

```python
import chromadb

persistent_client = chromadb.PersistentClient()
collection = persistent_client.get_or_create_collection("collection_name")
collection.add(ids=["1", "2", "3"], documents=["a", "b", "c"])

langchain_chroma = Chroma(
    client=persistent_client,
    collection_name="collection_name",
    embedding_function=embedding_function,
)

print("There are", langchain_chroma._collection.count(), "in the collection")
```

```output
Add of existing embedding ID: 1
Add of existing embedding ID: 2
Add of existing embedding ID: 3
Add of existing embedding ID: 1
Add of existing embedding ID: 2
Add of existing embedding ID: 3
Add of existing embedding ID: 1
Insert of existing embedding ID: 1
Add of existing embedding ID: 2
Insert of existing embedding ID: 2
Add of existing embedding ID: 3
Insert of existing embedding ID: 3

There are 3 in the collection
```

## 基本的な例 (Dockerコンテナを使用する)

ChromaサーバーをDockerコンテナで別途実行し、それに接続するクライアントを作成し、それをLangChainに渡すこともできます。

Chromaは複数の文書コレクションを処理する機能を持っていますが、LangChainのインターフェイスは1つを期待するため、コレクション名を指定する必要があります。LangChainが使用するデフォルトのコレクション名は "langchain" です。

Dockerイメージをクローン、ビルド、実行する方法は以下の通りです:

```sh
git clone git@github.com:chroma-core/chroma.git
```

`docker-compose.yml`ファイルを編集し、`environment`の下に`ALLOW_RESET=TRUE`を追加します。

```yaml
    ...
    command: uvicorn chromadb.app:app --reload --workers 1 --host 0.0.0.0 --port 8000 --log-config log_config.yml
    environment:
      - IS_PERSISTENT=TRUE
      - ALLOW_RESET=TRUE
    ports:
      - 8000:8000
    ...
```

次に`docker-compose up -d --build`を実行します。

```python
# create the chroma client
import uuid

import chromadb
from chromadb.config import Settings

client = chromadb.HttpClient(settings=Settings(allow_reset=True))
client.reset()  # resets the database
collection = client.create_collection("my_collection")
for doc in docs:
    collection.add(
        ids=[str(uuid.uuid1())], metadatas=doc.metadata, documents=doc.page_content
    )

# tell LangChain to use our client and collection name
db4 = Chroma(
    client=client,
    collection_name="my_collection",
    embedding_function=embedding_function,
)
query = "What did the president say about Ketanji Brown Jackson"
docs = db4.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## 更新と削除

実際のアプリケーションを構築する際は、データの追加だけでなく、更新と削除も行いたくなります。

Chromaでは、ブックキーピングを簡単にするために、ユーザーに`ids`を提供してもらいます。`ids`はファイル名や`filename_paragraphNumber`のようなハッシュ値にできます。

Chromaはこれらすべての操作をサポートしていますが、LangChainのインターフェイスにまだ完全に統合されていないものもあります。今後、ワークフローの改善が追加される予定です。

ここに、さまざまな操作を示す基本的な例を示します:

```python
# create simple ids
ids = [str(i) for i in range(1, len(docs) + 1)]

# add data
example_db = Chroma.from_documents(docs, embedding_function, ids=ids)
docs = example_db.similarity_search(query)
print(docs[0].metadata)

# update the metadata for a document
docs[0].metadata = {
    "source": "../../modules/state_of_the_union.txt",
    "new_value": "hello world",
}
example_db.update_document(ids[0], docs[0])
print(example_db._collection.get(ids=[ids[0]]))

# delete the last document
print("count before", example_db._collection.count())
example_db._collection.delete(ids=[ids[-1]])
print("count after", example_db._collection.count())
```

```output
{'source': '../../../state_of_the_union.txt'}
{'ids': ['1'], 'embeddings': None, 'metadatas': [{'new_value': 'hello world', 'source': '../../../state_of_the_union.txt'}], 'documents': ['Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.']}
count before 46
count after 45
```

## OpenAIエンベディングの使用

多くの人がOpenAIエンベディングを使用したがっています。設定方法は以下の通りです。

```python
# get a token: https://platform.openai.com/account/api-keys

from getpass import getpass

from langchain_openai import OpenAIEmbeddings

OPENAI_API_KEY = getpass()
```

```python
import os

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

```python
embeddings = OpenAIEmbeddings()
new_client = chromadb.EphemeralClient()
openai_lc_client = Chroma.from_documents(
    docs, embeddings, client=new_client, collection_name="openai_collection"
)

query = "What did the president say about Ketanji Brown Jackson"
docs = openai_lc_client.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

***

## その他の情報

### 類似性検索とスコア

返されるスコアはコサイン距離です。したがって、スコアが低いほど良い結果です。

```python
docs = db.similarity_search_with_score(query)
```

```python
docs[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'}),
 1.1972057819366455)
```

### リトリーバーのオプション

このセクションでは、Chromaをリトリーバーとして使用するための様々なオプションについて説明します。

#### MMR

リトリーバーオブジェクトで類似性検索を使用する以外に、`mmr`も使用できます。

```python
retriever = db.as_retriever(search_type="mmr")
```

```python
retriever.invoke(query)[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'})
```

### メタデータによるフィルタリング

コレクションを操作する前に、絞り込むことが役立つ場合があります。

例えば、メタデータを使ってコレクションをフィルタリングできます。

```python
# filter collection for updated source
example_db.get(where={"source": "some_other_source"})
```

```output
{'ids': [], 'embeddings': None, 'metadatas': [], 'documents': []}
```
