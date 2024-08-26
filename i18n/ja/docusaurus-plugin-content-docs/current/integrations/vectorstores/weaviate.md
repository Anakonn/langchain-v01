---
sidebar_label: Weaviate
translated: true
---

# Weaviate

このノートブックでは、`langchain-weaviate`パッケージを使用してLangChainでWeaviateベクトルストアを使い始める方法を紹介します。

> [Weaviate](https://weaviate.io/) はオープンソースのベクトルデータベースです。お気に入りのMLモデルからデータオブジェクトとベクトル埋め込みを保存し、数十億のデータオブジェクトにシームレスにスケールできます。

この統合を使用するには、稼働中のWeaviateデータベースインスタンスが必要です。

## 最低バージョン

このモジュールはWeaviate `1.23.7` 以上が必要です。ただし、最新バージョンのWeaviateを使用することをお勧めします。

## Weaviateへの接続

このノートブックでは、`http://localhost:8080` で稼働しているローカルのWeaviateインスタンスと、[gRPCトラフィック](https://weaviate.io/blog/grpc-performance-improvements)用にポート50051が開いていると仮定します。したがって、Weaviateに接続するには以下のようにします:

```python
weaviate_client = weaviate.connect_to_local()
```

### その他のデプロイメントオプション

Weaviateは[様々な方法でデプロイ](https://weaviate.io/developers/weaviate/starter-guides/which-weaviate)できます。例えば、[Weaviate Cloud Services (WCS)](https://console.weaviate.cloud)、[Docker](https://weaviate.io/developers/weaviate/installation/docker-compose)や[Kubernetes](https://weaviate.io/developers/weaviate/installation/kubernetes)を利用する方法があります。

Weaviateインスタンスが別の方法でデプロイされている場合、Weaviateに接続するための異なる方法について[こちらで詳しく読むことができます](https://weaviate.io/developers/weaviate/client-libraries/python#instantiate-a-client)。さまざまな[ヘルパー関数](https://weaviate.io/developers/weaviate/client-libraries/python#python-client-v4-helper-functions)を使用するか、[カスタムインスタンスを作成](https://weaviate.io/developers/weaviate/client-libraries/python#python-client-v4-explicit-connection)することができます。

> `v4` クライアントAPIが必要で、これにより `weaviate.WeaviateClient` オブジェクトが作成されることに注意してください。

### 認証

WCSで稼働しているものなど、一部のWeaviateインスタンスでは、APIキーやユーザー名+パスワード認証などの認証が有効になっています。

詳細については[クライアント認証ガイド](https://weaviate.io/developers/weaviate/client-libraries/python#authentication)や[詳細な認証構成ページ](https://weaviate.io/developers/weaviate/configuration/authentication)を参照してください。

## インストール

```python
# install package
# %pip install -Uqq langchain-weaviate
# %pip install openai tiktoken langchain
```

## 環境設定

このノートブックでは、`OpenAIEmbeddings` を通じてOpenAI APIを使用します。OpenAI APIキーを取得し、環境変数 `OPENAI_API_KEY` としてエクスポートすることをお勧めします。

これが完了すると、OpenAI APIキーが自動的に読み取られます。環境変数に不慣れな場合は、[こちら](https://docs.python.org/3/library/os.html#os.environ)や[このガイド](https://www.twilio.com/en-us/blog/environment-variables-python)を参照してください。

# 使用方法

## 類似性によるオブジェクトの検索

以下は、データのインポートからWeaviateインスタンスへのクエリまで、クエリに対する類似性によるオブジェクトの検索方法の例です。

### ステップ1: データのインポート

まず、長いテキストファイルの内容を読み込み、チャンク化して `Weaviate` に追加するデータを作成します。

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.openai import OpenAIEmbeddings
```

```python
loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The class `langchain_community.embeddings.openai.OpenAIEmbeddings` was deprecated in langchain-community 0.1.0 and will be removed in 0.2.0. An updated version of the class exists in the langchain-openai package and should be used instead. To use it run `pip install -U langchain-openai` and import as `from langchain_openai import OpenAIEmbeddings`.
  warn_deprecated(
```

さて、データをインポートできます。

そのためには、Weaviateインスタンスに接続し、生成された `weaviate_client` オブジェクトを使用します。例えば、以下のようにドキュメントをインポートできます:

```python
import weaviate
from langchain_weaviate.vectorstores import WeaviateVectorStore
```

```python
weaviate_client = weaviate.connect_to_local()
db = WeaviateVectorStore.from_documents(docs, embeddings, client=weaviate_client)
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

### ステップ2: 検索の実行

これで類似性検索を実行できます。これは、Weaviateに保存された埋め込みと、クエリテキストから生成された同等の埋め込みに基づいて、クエリテキストに最も類似したドキュメントを返します。

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)

# Print the first 100 characters of each result
for i, doc in enumerate(docs):
    print(f"\nDocument {i+1}:")
    print(doc.page_content[:100] + "...")
```

```output

Document 1:
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Ac...

Document 2:
And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of ...

Document 3:
Vice President Harris and I ran for office with a new economic vision for America.

Invest in Ameri...

Document 4:
A former top litigator in private practice. A former federal public defender. And from a family of p...
```

また、フィルターを追加して、フィルター条件に基づいて結果を含めたり除外したりすることもできます。（[フィルターの例をもっと見る](https://weaviate.io/developers/weaviate/search/filters).)）

```python
from weaviate.classes.query import Filter

for filter_str in ["blah.txt", "state_of_the_union.txt"]:
    search_filter = Filter.by_property("source").equal(filter_str)
    filtered_search_results = db.similarity_search(query, filters=search_filter)
    print(len(filtered_search_results))
    if filter_str == "state_of_the_union.txt":
        assert len(filtered_search_results) > 0  # There should be at least one result
    else:
        assert len(filtered_search_results) == 0  # There should be no results
```

```output
0
4
```

また、`k` を提供することも可能で、これは返す結果の数の上限です。

```python
search_filter = Filter.by_property("source").equal("state_of_the_union.txt")
filtered_search_results = db.similarity_search(query, filters=search_filter, k=3)
assert len(filtered_search_results) <= 3
```

### 結果の類似性を定量化

オプションで関連性の「スコア」を取得できます。これは、検索結果のプール内で特定の検索結果がどれだけ良いかを示す相対的なスコアです。

これは相対的なスコアであるため、関連性のしきい値を判断するために使用すべきではありませんが、検索結果全体の中で異なる検索結果の関連性を比較するために使用できます。

```python
docs = db.similarity_search_with_score("country", k=5)

for doc in docs:
    print(f"{doc[1]:.3f}", ":", doc[0].page_content[:100] + "...")
```

```output
0.935 : For that purpose we’ve mobilized American ground forces, air squadrons, and ship deployments to prot...
0.500 : And built the strongest, freest, and most prosperous nation the world has ever known.

Now is the h...
0.462 : If you travel 20 miles east of Columbus, Ohio, you’ll find 1,000 empty acres of land.

It won’t loo...
0.450 : And my report is this: the State of the Union is strong—because you, the American people, are strong...
0.442 : Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Ac...
```

## 検索メカニズム

`similarity_search` はWeaviateの[ハイブリッド検索](https://weaviate.io/developers/weaviate/api/graphql/search-operators#hybrid)を使用します。

ハイブリッド検索はベクトル検索とキーワード検索を組み合わせたもので、`alpha` はベクトル検索の重みです。`similarity_search` 関数では、kwargsとして追加の引数を渡すことができます。利用可能な引数についてはこの[参考ドキュメント](https://weaviate.io/developers/weaviate/api/graphql/search-operators#hybrid)を参照してください。

したがって、以下のように `alpha=0` を追加して純粋なキーワード検索を実行できます:

```python
docs = db.similarity_search(query, alpha=0)
docs[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'})
```

## 永続性

`langchain-weaviate` を通じて追加されたデータは、その構成に従ってWeaviateに永続的に保存されます。

例えば、WCSインスタンスはデータを無期限に保存するように構成されており、Dockerインスタンスはボリュームにデータを保存するように設定できます。[Weaviateの永続性](https://weaviate.io/developers/weaviate/configuration/persistence)について詳しく読むことができます。

## マルチテナンシー

[マルチテナンシー](https://weaviate.io/developers/weaviate/concepts/data#multi-tenancy)を使用すると、単一のWeaviateインスタンス内で同じコレクション構成のデータの分離された多数のコレクションを持つことができます。これは、各エンドユーザーが自分の分離されたデータコレクションを持つマルチユーザー環境（例えばSaaSアプリの構築）に最適です。

マルチテナンシーを使用するには、ベクトルストアが `tenant` パラメータを認識する必要があります。

したがって、データを追加する際には、以下のように `tenant` パラメータを提供します。

```python
db_with_mt = WeaviateVectorStore.from_documents(
    docs, embeddings, client=weaviate_client, tenant="Foo"
)
```

```output
2024-Mar-26 03:40 PM - langchain_weaviate.vectorstores - INFO - Tenant Foo does not exist in index LangChain_30b9273d43b3492db4fb2aba2e0d6871. Creating tenant.
```

クエリを実行する際にも、`tenant` パラメータを提供します。

```python
db_with_mt.similarity_search(query, tenant="Foo")
```

```output
[Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'}),
 Document(page_content='And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand. \n\nI remember when my Dad had to leave our home in Scranton, Pennsylvania to find work. I grew up in a family where if the price of food went up, you felt it. \n\nThat’s why one of the first things I did as President was fight to pass the American Rescue Plan.  \n\nBecause people were hurting. We needed to act, and we did. \n\nFew pieces of legislation have done more in a critical moment in our history to lift us out of crisis. \n\nIt fueled our efforts to vaccinate the nation and combat COVID-19. It delivered immediate economic relief for tens of millions of Americans.  \n\nHelped put food on their table, keep a roof over their heads, and cut the cost of health insurance. \n\nAnd as my Dad used to say, it gave people a little breathing room.', metadata={'source': 'state_of_the_union.txt'}),
 Document(page_content='He and his Dad both have Type 1 diabetes, which means they need insulin every day. Insulin costs about $10 a vial to make.  \n\nBut drug companies charge families like Joshua and his Dad up to 30 times more. I spoke with Joshua’s mom. \n\nImagine what it’s like to look at your child who needs insulin and have no idea how you’re going to pay for it.  \n\nWhat it does to your dignity, your ability to look your child in the eye, to be the parent you expect to be. \n\nJoshua is here with us tonight. Yesterday was his birthday. Happy birthday, buddy.  \n\nFor Joshua, and for the 200,000 other young people with Type 1 diabetes, let’s cap the cost of insulin at $35 a month so everyone can afford it.  \n\nDrug companies will still do very well. And while we’re at it let Medicare negotiate lower prices for prescription drugs, like the VA already does.', metadata={'source': 'state_of_the_union.txt'}),
 Document(page_content='Putin’s latest attack on Ukraine was premeditated and unprovoked. \n\nHe rejected repeated efforts at diplomacy. \n\nHe thought the West and NATO wouldn’t respond. And he thought he could divide us at home. Putin was wrong. We were ready.  Here is what we did.   \n\nWe prepared extensively and carefully. \n\nWe spent months building a coalition of other freedom-loving nations from Europe and the Americas to Asia and Africa to confront Putin. \n\nI spent countless hours unifying our European allies. We shared with the world in advance what we knew Putin was planning and precisely how he would try to falsely justify his aggression.  \n\nWe countered Russia’s lies with truth.   \n\nAnd now that he has acted the free world is holding him accountable. \n\nAlong with twenty-seven members of the European Union including France, Germany, Italy, as well as countries like the United Kingdom, Canada, Japan, Korea, Australia, New Zealand, and many others, even Switzerland.', metadata={'source': 'state_of_the_union.txt'})]
```

## リトリーバーオプション

Weaviateはリトリーバーとしても使用できます。

### 最大限のマージン関連性検索 (MMR)

リトリーバーオブジェクトでsimilaritysearchを使用するだけでなく、`mmr` を使用することもできます。

```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)[0]
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'})
```

# LangChainとの使用

大規模言語モデル（LLM）の既知の制限は、トレーニングデータが古くなっている可能性があるか、必要な特定のドメイン知識を含んでいない場合があることです。

以下の例を見てみましょう:

```python
from langchain_community.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
llm.predict("What did the president say about Justice Breyer")
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The class `langchain_community.chat_models.openai.ChatOpenAI` was deprecated in langchain-community 0.0.10 and will be removed in 0.2.0. An updated version of the class exists in the langchain-openai package and should be used instead. To use it run `pip install -U langchain-openai` and import as `from langchain_openai import ChatOpenAI`.
  warn_deprecated(
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The function `predict` was deprecated in LangChain 0.1.7 and will be removed in 0.2.0. Use invoke instead.
  warn_deprecated(
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
"I'm sorry, I cannot provide real-time information as my responses are generated based on a mixture of licensed data, data created by human trainers, and publicly available data. The last update was in October 2021."
```

ベクトルストアは、関連情報を保存および取得する方法を提供することでLLMを補完します。これにより、LLMの推論および言語能力を、ベクトルストアの関連情報を取得する能力と組み合わせることができます。

LLMとベクトルストアを組み合わせるためのよく知られたアプリケーションには、次の2つがあります：
- 質問応答
- 取得強化生成 (RAG)

### ソースを使った質問応答

langchainでの質問応答は、ベクトルストアの使用によって強化できます。これがどのように行われるか見てみましょう。

このセクションでは、`RetrievalQAWithSourcesChain` を使用し、インデックスからドキュメントを検索します。

まず、再度テキストをチャンク化し、Weaviateベクトルストアにインポートします。

```python
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_community.llms import OpenAI
```

```python
with open("state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```

```python
docsearch = WeaviateVectorStore.from_texts(
    texts,
    embeddings,
    client=weaviate_client,
    metadatas=[{"source": f"{i}-pl"} for i in range(len(texts))],
)
```

次に、指定されたリトリーバーでチェーンを構築します：

```python
chain = RetrievalQAWithSourcesChain.from_chain_type(
    OpenAI(temperature=0), chain_type="stuff", retriever=docsearch.as_retriever()
)
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The class `langchain_community.llms.openai.OpenAI` was deprecated in langchain-community 0.0.10 and will be removed in 0.2.0. An updated version of the class exists in the langchain-openai package and should be used instead. To use it run `pip install -U langchain-openai` and import as `from langchain_openai import OpenAI`.
  warn_deprecated(
```

そして、質問をするためにチェーンを実行します：

```python
chain(
    {"question": "What did the president say about Justice Breyer"},
    return_only_outputs=True,
)
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The function `__call__` was deprecated in LangChain 0.1.0 and will be removed in 0.2.0. Use invoke instead.
  warn_deprecated(
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
{'answer': ' The president thanked Justice Stephen Breyer for his service and announced his nomination of Judge Ketanji Brown Jackson to the Supreme Court.\n',
 'sources': '31-pl'}
```

### 取得強化生成 (RAG)

LLMとベクトルストアを組み合わせるもう一つの非常に人気のあるアプリケーションは、取得強化生成（RAG）です。これは、リトリーバーを使用してベクトルストアから関連情報を見つけ、取得したデータとプロンプトに基づいてLLMが出力を提供する技術です。

同様のセットアップで始めます：

```python
with open("state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```

```python
docsearch = WeaviateVectorStore.from_texts(
    texts,
    embeddings,
    client=weaviate_client,
    metadatas=[{"source": f"{i}-pl"} for i in range(len(texts))],
)

retriever = docsearch.as_retriever()
```

RAGモデルのためのテンプレートを構築し、取得された情報をテンプレートに挿入する必要があります。

```python
from langchain_core.prompts import ChatPromptTemplate

template = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question: {question}
Context: {context}
Answer:
"""
prompt = ChatPromptTemplate.from_template(template)

print(prompt)
```

```output
input_variables=['context', 'question'] messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['context', 'question'], template="You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.\nQuestion: {question}\nContext: {context}\nAnswer:\n"))]
```

```python
from langchain_community.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
```

セルを実行すると、非常に類似した出力が得られます。

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

rag_chain.invoke("What did the president say about Justice Breyer")
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
"The president honored Justice Stephen Breyer for his service to the country as an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. The president also mentioned nominating Circuit Court of Appeals Judge Ketanji Brown Jackson to continue Justice Breyer's legacy of excellence. The president expressed gratitude towards Justice Breyer and highlighted the importance of nominating someone to serve on the United States Supreme Court."
```

しかし、テンプレートは自分で構築するため、ニーズに合わせてカスタマイズできます。

### まとめとリソース

Weaviateはスケーラブルで、プロダクション対応のベクトルストアです。

この統合により、WeaviateをLangChainと共に使用して、大規模言語モデルの機能を強化することができます。そのスケーラビリティとプロダクション対応性は、LangChainアプリケーションのベクトルストアとして優れた選択肢であり、プロダクションまでの時間を短縮します。
