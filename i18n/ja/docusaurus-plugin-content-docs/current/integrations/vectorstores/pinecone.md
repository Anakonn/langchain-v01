---
translated: true
---

# ピネコーン

>[ピネコーン](https://docs.pinecone.io/docs/overview)は広範な機能を持つベクトルデータベースです。

このノートブックでは、`Pinecone`ベクトルデータベースに関連する機能の使用方法を示します。

Pineconeを使用するには、APIキーが必要です。
[インストール手順](https://docs.pinecone.io/docs/quickstart)はこちらです。

`Pinecone`インテグレーションの使用を簡単にするために、次の環境変数を設定してください:

- `PINECONE_API_KEY`: あなたのPinecone APIキー。
- `PINECONE_INDEX_NAME`: 使用したいインデックスの名前。

このドキュメントに沿って進むには、次の設定も必要です:

- `OPENAI_API_KEY`: `OpenAIEmbeddings`を使用するためのOpenAI APIキー

```python
%pip install --upgrade --quiet  langchain-pinecone langchain-openai langchain
```

移行に関する注意: `langchain_community.vectorstores`のPineconeの実装から移行する場合は、`langchain-pinecone`をインストールする前に`pinecone-client` v2の依存関係を削除する必要があるかもしれません。これは`pinecone-client` v3に依存しています。

まず、国家の現状に関する文書をチャンクに分割して`docs`を作りましょう。

```python
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

次に、`dimension=1536`で設定されたPineconeインデックスがあると仮定しましょう。

`PineconeVectorStore.from_documents`を使って、これらのチャンク化されたドキュメントをコンテンツとしてPineconeインデックスに挿入することができます。

```python
from langchain_pinecone import PineconeVectorStore

index_name = "langchain-test-index"

docsearch = PineconeVectorStore.from_documents(docs, embeddings, index_name=index_name)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

### 既存のインデックスにさらにテキストを追加する

`add_texts`関数を使って、既存のPineconeインデックスにさらにテキストをエンベディングしてアップサートすることができます。

```python
vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)

vectorstore.add_texts(["More text!"])
```

```output
['24631802-4bad-44a7-a4ba-fd71f00cc160']
```

### 最大限の限界関連性検索

リトリーバーオブジェクトでの類似性検索に加えて、`mmr`としてリトリーバーを使うこともできます。

```python
retriever = docsearch.as_retriever(search_type="mmr")
matched_docs = retriever.invoke(query)
for i, d in enumerate(matched_docs):
    print(f"\n## Document {i}\n")
    print(d.page_content)
```

```output

## Document 0

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

## Document 1

And I’m taking robust action to make sure the pain of our sanctions  is targeted at Russia’s economy. And I will use every tool at our disposal to protect American businesses and consumers.

Tonight, I can announce that the United States has worked with 30 other countries to release 60 Million barrels of oil from reserves around the world.

America will lead that effort, releasing 30 Million barrels from our own Strategic Petroleum Reserve. And we stand ready to do more if necessary, unified with our allies.

These steps will help blunt gas prices here at home. And I know the news about what’s happening can seem alarming.

But I want you to know that we are going to be okay.

When the history of this era is written Putin’s war on Ukraine will have left Russia weaker and the rest of the world stronger.

While it shouldn’t have taken something so terrible for people around the world to see what’s at stake now everyone sees it clearly.

## Document 2

We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together.

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera.

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.

## Document 3

One was stationed at bases and breathing in toxic smoke from “burn pits” that incinerated wastes of war—medical and hazard material, jet fuel, and more.

When they came home, many of the world’s fittest and best trained warriors were never the same.

Headaches. Numbness. Dizziness.

A cancer that would put them in a flag-draped coffin.

I know.

One of those soldiers was my son Major Beau Biden.

We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops.

But I’m committed to finding out everything we can.

Committed to military families like Danielle Robinson from Ohio.

The widow of Sergeant First Class Heath Robinson.

He was born a soldier. Army National Guard. Combat medic in Kosovo and Iraq.

Stationed near Baghdad, just yards from burn pits the size of football fields.

Heath’s widow Danielle is here with us tonight. They loved going to Ohio State football games. He loved building Legos with their daughter.
```

または、`max_marginal_relevance_search`を直接使うこともできます:

```python
found_docs = docsearch.max_marginal_relevance_search(query, k=2, fetch_k=10)
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
