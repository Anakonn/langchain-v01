---
translated: true
---

# Intel のビジュアルデータ管理システム (VDMS)

>Intel の [VDMS](https://github.com/IntelLabs/vdms) は、ビジュアルメタデータをグラフとして保存し、ビジュアルデータの機械的な強化を可能にすることで、関連するビジュアルデータを検索することを目的とした、ビッグ "ビジュアル" データへの効率的なアクセスを実現するためのストレージソリューションです。VDMS は MIT ライセンスの下で提供されています。

VDMS は以下をサポートしています:
* K 最近傍検索
* ユークリッド距離 (L2) および内積 (IP)
* インデックス作成と距離計算のためのライブラリ: TileDBDense、TileDBSparse、FaissFlat (デフォルト)、FaissIVFFlat
* ベクトルおよびメタデータ検索

VDMS にはサーバーとクライアントのコンポーネントがあります。サーバーのセットアップについては、[インストール手順](https://github.com/IntelLabs/vdms/blob/master/INSTALL.md)を参照するか、[Docker イメージ](https://hub.docker.com/r/intellabs/vdms)を使用してください。

このノートブックでは、Docker イメージを使用して VDMS をベクトルストアとして使用する方法を示します。

始めるには、VDMS クライアントと Sentence Transformers の Python パッケージをインストールします:

```python
# Pip install necessary package
%pip install --upgrade --quiet pip sentence-transformers vdms "unstructured-inference==0.6.6";
```

```output
Note: you may need to restart the kernel to use updated packages.
```

## VDMS サーバーの起動

ここでは、ポート 55555 で VDMS サーバーを起動します。

```python
!docker run --rm -d -p 55555:55555 --name vdms_vs_test_nb intellabs/vdms:latest
```

```output
e6061b270eef87de5319a6c5af709b36badcad8118069a8f6b577d2e01ad5e2d
```

## 基本的な例 (Docker コンテナを使用)

この基本的な例では、VDMS にドキュメントを追加し、ベクトルデータベースとして使用する方法を示します。

VDMS サーバーを別の Docker コンテナで実行し、VDMS Python クライアントを介して LangChain に接続することができます。

VDMS は複数のドキュメントコレクションを処理できますが、LangChain インターフェイスでは 1 つのコレクションを想定しているため、コレクション名を指定する必要があります。LangChain で使用されるデフォルトのコレクション名は "langchain" です。

```python
import time

from langchain_community.document_loaders.text import TextLoader
from langchain_community.embeddings.huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import VDMS
from langchain_community.vectorstores.vdms import VDMS_Client
from langchain_text_splitters.character import CharacterTextSplitter

time.sleep(2)
DELIMITER = "-" * 50

# Connect to VDMS Vector Store
vdms_client = VDMS_Client(host="localhost", port=55555)
```

結果を表示するためのヘルパー関数です。

```python
def print_document_details(doc):
    print(f"Content:\n\t{doc.page_content}\n")
    print("Metadata:")
    for key, value in doc.metadata.items():
        if value != "Missing property":
            print(f"\t{key}:\t{value}")


def print_results(similarity_results, score=True):
    print(f"{DELIMITER}\n")
    if score:
        for doc, score in similarity_results:
            print(f"Score:\t{score}\n")
            print_document_details(doc)
            print(f"{DELIMITER}\n")
    else:
        for doc in similarity_results:
            print_document_details(doc)
            print(f"{DELIMITER}\n")


def print_response(list_of_entities):
    for ent in list_of_entities:
        for key, value in ent.items():
            if value != "Missing property":
                print(f"\n{key}:\n\t{value}")
        print(f"{DELIMITER}\n")
```

### ドキュメントの読み込みと埋め込み関数の取得

ここでは、最新の State of the Union Address を読み込み、ドキュメントをチャンクに分割します。

LangChain ベクトルストアでは、ドキュメントの管理に文字列/キーワード `id` を使用します。デフォルトでは `id` は uuid ですが、ここでは整数を文字列にキャストしています。ドキュメントにはさらにメタデータが提供され、この例では HuggingFaceEmbeddings が埋め込み関数として使用されます。

```python
# load the document and split it into chunks
document_path = "../../modules/state_of_the_union.txt"
raw_documents = TextLoader(document_path).load()

# split it into chunks
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(raw_documents)
ids = []
for doc_idx, doc in enumerate(docs):
    ids.append(str(doc_idx + 1))
    docs[doc_idx].metadata["id"] = str(doc_idx + 1)
    docs[doc_idx].metadata["page_number"] = int(doc_idx + 1)
    docs[doc_idx].metadata["president_included"] = (
        "president" in doc.page_content.lower()
    )
print(f"# Documents: {len(docs)}")


# create the open-source embedding function
embedding = HuggingFaceEmbeddings()
print(
    f"# Embedding Dimensions: {len(embedding.embed_query('This is a test document.'))}"
)
```

```output
# Documents: 42
# Embedding Dimensions: 768
```

### Faiss Flat と Euclidean 距離 (デフォルト) を使用した類似検索

このセクションでは、FAISS IndexFlat インデックス (デフォルト) と Euclidean 距離 (デフォルト) を使用して、ドキュメントを VDMS に追加します。クエリ `Ketanji Brown Jackson について大統領はどのようなことを言ったか` に関連する 3 件 (`k=3`) のドキュメントを検索します。

```python
# add data
collection_name = "my_collection_faiss_L2"
db = VDMS.from_documents(
    docs,
    client=vdms_client,
    ids=ids,
    collection_name=collection_name,
    embedding=embedding,
)

# Query (No metadata filtering)
k = 3
query = "What did the president say about Ketanji Brown Jackson"
returned_docs = db.similarity_search(query, k=k, filter=None)
print_results(returned_docs, score=False)
```

```output
--------------------------------------------------

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Content:
	As Frances Haugen, who is here with us tonight, has shown, we must hold social media platforms accountable for the national experiment they’re conducting on our children for profit.

It’s time to strengthen privacy protections, ban targeted advertising to children, demand tech companies stop collecting personal data on our children.

And let’s get all Americans the mental health services they need. More people they can turn to for help, and full parity between physical and mental health care.

Third, support our veterans.

Veterans are the best of us.

I’ve always believed that we have a sacred obligation to equip all those we send to war and care for them and their families when they come home.

My administration is providing assistance with job training and housing, and now helping lower-income veterans get VA care debt-free.

Our troops in Iraq and Afghanistan faced many dangers.

Metadata:
	id:	37
	page_number:	37
	president_included:	False
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Content:
	A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.

Metadata:
	id:	33
	page_number:	33
	president_included:	False
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------
```

```python
# Query (with filtering)
k = 3
constraints = {"page_number": [">", 30], "president_included": ["==", True]}
query = "What did the president say about Ketanji Brown Jackson"
returned_docs = db.similarity_search(query, k=k, filter=constraints)
print_results(returned_docs, score=False)
```

```output
--------------------------------------------------

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Content:
	And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong.

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential.

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things.

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.

First, beat the opioid epidemic.

Metadata:
	id:	35
	page_number:	35
	president_included:	True
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Content:
	Last month, I announced our plan to supercharge
the Cancer Moonshot that President Obama asked me to lead six years ago.

Our goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases.

More support for patients and families.

To get there, I call on Congress to fund ARPA-H, the Advanced Research Projects Agency for Health.

It’s based on DARPA—the Defense Department project that led to the Internet, GPS, and so much more.

ARPA-H will have a singular purpose—to drive breakthroughs in cancer, Alzheimer’s, diabetes, and more.

A unity agenda for the nation.

We can do this.

My fellow Americans—tonight , we have gathered in a sacred space—the citadel of our democracy.

In this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things.

We have fought for freedom, expanded liberty, defeated totalitarianism and terror.

Metadata:
	id:	40
	page_number:	40
	president_included:	True
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------
```

### TileDBDense と Euclidean 距離を使用した類似検索

このセクションでは、TileDB Dense インデックスと L2 距離メトリックを使用して、ドキュメントを VDMS に追加します。クエリ `Ketanji Brown Jackson について大統領はどのようなことを言ったか` に関連する 3 件 (`k=3`) のドキュメントを検索し、スコアも返します。

```python
db_tiledbD = VDMS.from_documents(
    docs,
    client=vdms_client,
    ids=ids,
    collection_name="my_collection_tiledbD_L2",
    embedding=embedding,
    engine="TileDBDense",
    distance_strategy="L2",
)

k = 3
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db_tiledbD.similarity_search_with_score(query, k=k, filter=None)
print_results(docs_with_score)
```

```output
--------------------------------------------------

Score:	1.2032090425491333

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Score:	1.495247483253479

Content:
	As Frances Haugen, who is here with us tonight, has shown, we must hold social media platforms accountable for the national experiment they’re conducting on our children for profit.

It’s time to strengthen privacy protections, ban targeted advertising to children, demand tech companies stop collecting personal data on our children.

And let’s get all Americans the mental health services they need. More people they can turn to for help, and full parity between physical and mental health care.

Third, support our veterans.

Veterans are the best of us.

I’ve always believed that we have a sacred obligation to equip all those we send to war and care for them and their families when they come home.

My administration is providing assistance with job training and housing, and now helping lower-income veterans get VA care debt-free.

Our troops in Iraq and Afghanistan faced many dangers.

Metadata:
	id:	37
	page_number:	37
	president_included:	False
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Score:	1.5008409023284912

Content:
	A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.

Metadata:
	id:	33
	page_number:	33
	president_included:	False
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------
```

### Faiss IVFFlat と Euclidean 距離を使用した類似検索

このセクションでは、Faiss IndexIVFFlat インデックスと L2 距離メトリックを使用して、ドキュメントを VDMS に追加します。クエリ `Ketanji Brown Jackson について大統領はどのようなことを言ったか` に関連する 3 件 (`k=3`) のドキュメントを検索し、スコアも返します。

```python
db_FaissIVFFlat = VDMS.from_documents(
    docs,
    client=vdms_client,
    ids=ids,
    collection_name="my_collection_FaissIVFFlat_L2",
    embedding=embedding,
    engine="FaissIVFFlat",
    distance_strategy="L2",
)
# Query
k = 3
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db_FaissIVFFlat.similarity_search_with_score(query, k=k, filter=None)
print_results(docs_with_score)
```

```output
--------------------------------------------------

Score:	1.2032090425491333

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Score:	1.495247483253479

Content:
	As Frances Haugen, who is here with us tonight, has shown, we must hold social media platforms accountable for the national experiment they’re conducting on our children for profit.

It’s time to strengthen privacy protections, ban targeted advertising to children, demand tech companies stop collecting personal data on our children.

And let’s get all Americans the mental health services they need. More people they can turn to for help, and full parity between physical and mental health care.

Third, support our veterans.

Veterans are the best of us.

I’ve always believed that we have a sacred obligation to equip all those we send to war and care for them and their families when they come home.

My administration is providing assistance with job training and housing, and now helping lower-income veterans get VA care debt-free.

Our troops in Iraq and Afghanistan faced many dangers.

Metadata:
	id:	37
	page_number:	37
	president_included:	False
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Score:	1.5008409023284912

Content:
	A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.

Metadata:
	id:	33
	page_number:	33
	president_included:	False
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------
```

### 更新と削除

実際のアプリケーションを構築する際は、データの追加だけでなく、更新と削除も行う必要があります。

ここでは、基本的な例を示します。まず、クエリに最も関連性の高いドキュメントのメタデータを更新します。

```python
doc = db.similarity_search(query)[0]
print(f"Original metadata: \n\t{doc.metadata}")

# update the metadata for a document
doc.metadata["new_value"] = "hello world"
print(f"new metadata: \n\t{doc.metadata}")
print(f"{DELIMITER}\n")

# Update document in VDMS
id_to_update = doc.metadata["id"]
db.update_document(collection_name, id_to_update, doc)
response, response_array = db.get(
    collection_name, constraints={"id": ["==", id_to_update]}
)

# Display Results
print(f"UPDATED ENTRY (id={id_to_update}):")
print_response([response[0]["FindDescriptor"]["entities"][0]])
```

```output
Original metadata:
	{'id': '32', 'page_number': 32, 'president_included': True, 'source': '../../modules/state_of_the_union.txt'}
new metadata:
	{'id': '32', 'page_number': 32, 'president_included': True, 'source': '../../modules/state_of_the_union.txt', 'new_value': 'hello world'}
--------------------------------------------------

UPDATED ENTRY (id=32):

content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

id:
	32

new_value:
	hello world

page_number:
	32

president_included:
	True

source:
	../../modules/state_of_the_union.txt
--------------------------------------------------
```

次に、ID (id=42) の最後のドキュメントを削除します。

```python
print("Documents before deletion: ", db.count(collection_name))

id_to_remove = ids[-1]
db.delete(collection_name=collection_name, ids=[id_to_remove])
print(f"Documents after deletion (id={id_to_remove}): {db.count(collection_name)}")
```

```output
Documents before deletion:  42
Documents after deletion (id=42): 41
```

## その他の情報

VDMS は様々なタイプのビジュアルデータと操作をサポートしています。一部の機能は LangChain インターフェイスに統合されていますが、VDMS の継続的な開発に伴い、さらなるワークフローの改善が行われる予定です。

LangChain に統合された追加の機能は以下の通りです。

### ベクトルによる類似検索

文字列クエリではなく、埋め込み/ベクトルによる検索も可能です。

```python
embedding_vector = embedding.embed_query(query)
returned_docs = db.similarity_search_by_vector(embedding_vector)

# Print Results
print_document_details(returned_docs[0])
```

```output
Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	new_value:	hello world
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
```

### メタデータによるフィルタリング

コレクションを操作する前に、絞り込むことが役立つ場合があります。

例えば、メタデータを使ってコレクションをフィルタリングできます。ここでは、`id = 2` のドキュメントを取得し、ベクトルストアから削除します。

```python
response, response_array = db.get(
    collection_name,
    limit=1,
    include=["metadata", "embeddings"],
    constraints={"id": ["==", "2"]},
)

print("Returned entry:")
print_response([response[0]["FindDescriptor"]["entities"][0]])

# Delete id=2
db.delete(collection_name=collection_name, ids=["2"]);
```

```output
Returned entry:

blob:
	True

content:
	Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland.

In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.” The Ukrainian Ambassador to the United States is here tonight.

Let each of us here tonight in this Chamber send an unmistakable signal to Ukraine and to the world.

Please rise if you are able and show that, Yes, we the United States of America stand with the Ukrainian people.

Throughout our history we’ve learned this lesson when dictators do not pay a price for their aggression they cause more chaos.

They keep moving.

And the costs and the threats to America and the world keep rising.

That’s why the NATO Alliance was created to secure peace and stability in Europe after World War 2.

The United States is a member along with 29 other nations.

It matters. American diplomacy matters. American resolve matters.

id:
	2

page_number:
	2

president_included:
	True

source:
	../../modules/state_of_the_union.txt
--------------------------------------------------
```

### リトリーバーのオプション

このセクションでは、VDMS をリトリーバーとして使用するためのさまざまなオプションについて説明します。

#### 類似検索

ここでは、リトリーバーオブジェクトで類似検索を使用しています。

```python
retriever = db.as_retriever()
relevant_docs = retriever.invoke(query)[0]

print_document_details(relevant_docs)
```

```output
Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	new_value:	hello world
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
```

#### 最大限の限界関連性検索 (MMR)

リトリーバーオブジェクトで類似検索を使用する以外に、`mmr` も使用できます。

```python
retriever = db.as_retriever(search_type="mmr")
relevant_docs = retriever.invoke(query)[0]

print_document_details(relevant_docs)
```

```output
Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	new_value:	hello world
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
```

MMR を直接使用することもできます。

```python
mmr_resp = db.max_marginal_relevance_search_with_score(query, k=2, fetch_k=10)
print_results(mmr_resp)
```

```output
--------------------------------------------------

Score:	1.2032092809677124

Content:
	Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

Metadata:
	id:	32
	new_value:	hello world
	page_number:	32
	president_included:	True
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------

Score:	1.507053256034851

Content:
	But cancer from prolonged exposure to burn pits ravaged Heath’s lungs and body.

Danielle says Heath was a fighter to the very end.

He didn’t know how to stop fighting, and neither did she.

Through her pain she found purpose to demand we do better.

Tonight, Danielle—we are.

The VA is pioneering new ways of linking toxic exposures to diseases, already helping more veterans get benefits.

And tonight, I’m announcing we’re expanding eligibility to veterans suffering from nine respiratory cancers.

I’m also calling on Congress: pass a law to make sure veterans devastated by toxic exposures in Iraq and Afghanistan finally get the benefits and comprehensive health care they deserve.

And fourth, let’s end cancer as we know it.

This is personal to me and Jill, to Kamala, and to so many of you.

Cancer is the #2 cause of death in America–second only to heart disease.

Metadata:
	id:	39
	page_number:	39
	president_included:	False
	source:	../../modules/state_of_the_union.txt
--------------------------------------------------
```

### コレクションの削除

以前は、`id`に基づいてドキュメントを削除しました。ここでは、IDが提供されていないため、すべてのドキュメントが削除されます。

```python
print("Documents before deletion: ", db.count(collection_name))

db.delete(collection_name=collection_name)

print("Documents after deletion: ", db.count(collection_name))
```

```output
Documents before deletion:  40
Documents after deletion:  0
```

## VDMS サーバーの停止

```python
!docker kill vdms_vs_test_nb
```

```output
huggingface/tokenizers: The current process just got forked, after parallelism has already been used. Disabling parallelism to avoid deadlocks...
To disable this warning, you can either:
	- Avoid using `tokenizers` before the fork if possible
	- Explicitly set the environment variable TOKENIZERS_PARALLELISM=(true | false)

vdms_vs_test_nb
```
