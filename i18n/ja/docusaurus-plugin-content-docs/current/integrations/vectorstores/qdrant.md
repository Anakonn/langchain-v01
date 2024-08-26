---
translated: true
---

# Qdrant

>[Qdrant](https://qdrant.tech/documentation/)（クアドラントと読む）は、ベクトル類似性検索エンジンです。便利なAPIを備えた本番環境対応のサービスを提供し、ベクトルと追加のペイロードを格納、検索、管理することができます。`Qdrant`は拡張フィルタリングをサポートしているため、ニューラルネットワークやセマンティックベースのマッチング、ファセット検索、その他のアプリケーションに役立ちます。

このノートブックでは、`Qdrant`ベクトルデータベースの機能の使用方法を示します。

`Qdrant`を実行する方法には様々なモードがあり、選択したモードによって微妙な違いがあります。オプションには以下のようなものがあります:
- ローカルモード、サーバーは不要
- オンプレミスサーバーのデプロイ
- Qdrant Cloud

[インストール手順](https://qdrant.tech/documentation/install/)をご覧ください。

```python
%pip install --upgrade --quiet  qdrant-client
```

`OpenAIEmbeddings`を使用するには、OpenAI APIキーを取得する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key: ········
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Qdrant
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

## LangChainからQdrantに接続する

### ローカルモード

Pythonクライアントを使えば、Qdrantサーバーを実行せずにローカルモードで同じコードを実行できます。これは、小規模なベクトルを保存する場合のテストやデバッグに最適です。エンベディングはメモリ内に保持されるか、ディスクに永続化されます。

#### メモリ内

テストシナリオや簡単な実験の場合は、すべてのデータをメモリ内に保持し、クライアントが破棄されると（通常はスクリプト/ノートブックの終了時）失われるようにすることができます。

```python
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    location=":memory:",  # Local mode with in-memory storage only
    collection_name="my_documents",
)
```

#### ディスク上のストレージ

Qdrantサーバーを使わないローカルモードでも、ベクトルをディスク上に保存して実行間で永続化することができます。

```python
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    path="/tmp/local_qdrant",
    collection_name="my_documents",
)
```

### オンプレミスサーバーのデプロイ

[Dockerコンテナ](https://qdrant.tech/documentation/install/)でローカルにQdrantを起動するか、[公式Helmチャート](https://github.com/qdrant/qdrant-helm)でKubernetesデプロイメントを選択するかに関わらず、そのインスタンスに接続する方法は同じです。サービスを指すURLを提供する必要があります。

```python
url = "<---qdrant url here --->"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    collection_name="my_documents",
)
```

### Qdrant Cloud

インフラの管理に煩わされたくない場合は、[Qdrant Cloud](https://cloud.qdrant.io/)で完全に管理されたQdrantクラスターを設定することができます。試用用の1GBクラスターが永久無料で提供されています。Qdrantの管理バージョンを使う主な違いは、パブリックアクセスから保護するためにAPIキーを提供する必要があることです。

```python
url = "<---qdrant cloud cluster url here --->"
api_key = "<---api key here--->"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    api_key=api_key,
    collection_name="my_documents",
)
```

## コレクションの再作成

`Qdrant.from_texts`と`Qdrant.from_documents`メソッドは、LangChainでQdrantを使い始める際に便利です。以前のバージョンでは、これらのメソッドを呼び出すたびにコレクションが再作成されていました。その動作は変更されました。現在、コレクションが既に存在する場合は再利用されます。`force_recreate`を`True`に設定すると、古いコレクションを削除して最初から始めることができます。

```python
url = "<---qdrant url here --->"
qdrant = Qdrant.from_documents(
    docs,
    embeddings,
    url=url,
    prefer_grpc=True,
    collection_name="my_documents",
    force_recreate=True,
)
```

## 類似検索

Qdrantベクトルストアを使う最も単純なシナリオは、類似検索を行うことです。内部では、クエリが`embedding_function`でエンコーディングされ、Qdrantコレクション内の類似ドキュメントを検索するために使用されます。

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search(query)
```

```python
print(found_docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## スコア付きの類似検索

時には、検索を実行し、関連性スコアも取得して特定の結果がどの程度良いかを知りたい場合があります。
返されるdistance scoreはコサイン距離です。したがって、スコアが低いほど良い結果です。

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search_with_score(query)
```

```python
document, score = found_docs[0]
print(document.page_content)
print(f"\nScore: {score}")
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Score: 0.8153784913324512
```

### メタデータフィルタリング

Qdrantには[豊富なフィルタリングシステム](https://qdrant.tech/documentation/concepts/filtering/)があり、様々なデータ型をサポートしています。LangChainでもフィルタを使うことができ、`similarity_search_with_score`と`similarity_search`メソッドに追加のパラメータを渡すことで実現できます。

```python
from qdrant_client.http import models as rest

query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.similarity_search_with_score(query, filter=rest.Filter(...))
```

## 最大限の限界関連性検索（MMR）

類似ドキュメントを検索したいが、多様な結果も受け取りたい場合は、MMRを検討する必要があります。最大限の限界関連性は、クエリとの類似性と選択されたドキュメントの多様性を最適化します。

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = qdrant.max_marginal_relevance_search(query, k=2, fetch_k=10)
```

```python
for i, doc in enumerate(found_docs):
    print(f"{i + 1}.", doc.page_content, "\n")
```

```output
1. Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

2. We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together.

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera.

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.
```

## RetrieverとしてのQdrant

Qdrantは、他のすべてのベクトルストアと同様に、コサイン類似性を使ったLangChainのRetrieverです。

```python
retriever = qdrant.as_retriever()
retriever
```

```output
VectorStoreRetriever(vectorstore=<langchain_community.vectorstores.qdrant.Qdrant object at 0x7fc4e5720a00>, search_type='similarity', search_kwargs={})
```

検索戦略としてMMRを使うように指定することもできます。

```python
retriever = qdrant.as_retriever(search_type="mmr")
retriever
```

```output
VectorStoreRetriever(vectorstore=<langchain_community.vectorstores.qdrant.Qdrant object at 0x7fc4e5720a00>, search_type='mmr', search_kwargs={})
```

```python
query = "What did the president say about Ketanji Brown Jackson"
retriever.invoke(query)[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'})
```

## Qdrantのカスタマイズ

Langchain アプリケーション内で既存のQdrantコレクションを使用する場合のオプションがいくつかあります。その場合、Qdrantポイントをlangchainの`Document`にマッピングする方法を定義する必要があるかもしれません。

### 名前付きベクトル

Qdrantは[ポイントあたり複数のベクトル](https://qdrant.tech/documentation/concepts/collections/#collection-with-multiple-vectors)をサポートしています。LangChainでは、ドキュメントあたり1つのエンベディングしか必要ありませんが、デフォルトでは単一のベクトルを使用します。ただし、外部で作成されたコレクションを使用する場合や、特定の名前付きベクトルを使用したい場合は、その名前を指定して設定することができます。

```python
Qdrant.from_documents(
    docs,
    embeddings,
    location=":memory:",
    collection_name="my_documents_2",
    vector_name="custom_vector",
)
```

LangChainユーザーとしては、名前付きベクトルを使うかどうかに関わらず、違いは見えません。Qdrantインテグレーションが内部で変換を処理します。

### メタデータ

Qdrantはベクトル埋め込みとオプションのJSON形式のペイロードを保存します。ペイロードはオプションですが、LangChainはembeddingsがドキュメントから生成されたと想定しているため、元のテキストを抽出できるようにコンテキストデータを保持しています。

デフォルトでは、ドキュメントは以下のペイロード構造で保存されます:

```json
{
    "page_content": "Lorem ipsum dolor sit amet",
    "metadata": {
        "foo": "bar"
    }
}
```

ただし、ページコンテンツとメタデータのキーを異なるものに設定することもできます。既存のコレクションを再利用したい場合に便利です。

```python
Qdrant.from_documents(
    docs,
    embeddings,
    location=":memory:",
    collection_name="my_documents_2",
    content_payload_key="my_page_content_key",
    metadata_payload_key="my_meta",
)
```

```output
<langchain_community.vectorstores.qdrant.Qdrant at 0x7fc4e2baa230>
```
