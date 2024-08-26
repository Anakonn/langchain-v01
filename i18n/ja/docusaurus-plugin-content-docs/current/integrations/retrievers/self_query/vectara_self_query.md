---
translated: true
---

# Vectara

>[Vectara](https://vectara.com/) は、ドキュメントのインデックス作成とクエリのための使いやすいAPIを提供する信頼できるGenAIプラットフォームです。
>
>`Vectara` は、`Retrieval Augmented Generation` または [RAG](https://vectara.com/grounded-generation/) のためのエンドツーエンドのマネージドサービスを提供します。これには以下が含まれます：
>1. ドキュメントファイルから`テキストを抽出`し、それを文に`分割`する方法。
>2. 最先端の [Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/) 埋め込みモデル。各テキストチャンクは `Boomerang` を使用してベクトル埋め込みにエンコードされ、Vectara内部の知識（ベクトル+テキスト）ストアに保存されます。
>3. クエリを自動的に埋め込みにエンコードし、最も関連性の高いテキストセグメントを取得するクエリサービス（[ハイブリッド検索](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching) と [MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/)) のサポートを含む）。
>4. 取得したドキュメントに基づいて[生成的サマリー](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview) を作成するオプション（引用を含む）。

APIの使用方法については、[Vectara API ドキュメント](https://docs.vectara.com/docs/) を参照してください。

このノートブックでは、`SelfQueryRetriever` をVectaraと一緒に使用する方法を示します。

# セットアップ

`Vectara` を `LangChain` で使用するには、`Vectara` アカウントが必要です。始めるには、次の手順を使用します（[クイックスタート](https://docs.vectara.com/docs/quickstart) ガイドを参照）：
1. `Vectara` アカウントに[サインアップ](https://console.vectara.com/signup) します。サインアップを完了すると、Vectara 顧客IDが取得できます。顧客IDは、Vectara コンソールウィンドウの右上にあるあなたの名前をクリックすると確認できます。
2. アカウント内で1つ以上のコーパスを作成できます。各コーパスは、入力ドキュメントから取り込んだテキストデータを保存するエリアを表します。コーパスを作成するには、**"Create Corpus"** ボタンを使用します。コーパスに名前と説明を提供します。オプションでフィルタリング属性を定義し、いくつかの高度なオプションを適用できます。作成したコーパスをクリックすると、その名前とコーパスIDが上部に表示されます。
3. 次に、コーパスにアクセスするためのAPIキーを作成する必要があります。コーパスビューで **"Authorization"** タブをクリックし、**"Create API Key"** ボタンをクリックします。キーに名前を付け、クエリ専用またはクエリ+インデックスのいずれかを選択します。「作成」をクリックすると、アクティブなAPIキーが取得できます。このキーは機密情報として扱ってください。

LangChainでVectaraを使用するには、顧客ID、コーパスID、およびapi_keyの3つの値が必要です。
これらをLangChainに提供する方法は2つあります：

1. 環境変数にこれら3つの変数を含めます：`VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` および `VECTARA_API_KEY`。

> 例えば、`os.environ` および `getpass` を使用してこれらの変数を設定できます：

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. `Vectara` ベクトルストアオブジェクトを作成する際に引数として提供します：

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

**注:** セルフクエリリトリーバーを使用するには、`lark` がインストールされている必要があります（`pip install lark`）。

## LangChainからVectaraに接続する

この例では、アカウントとコーパスを作成し、VECTARA_CUSTOMER_ID、VECTARA_CORPUS_ID、およびVECTARA_API_KEY（インデックス作成とクエリの両方の権限で作成された）を環境変数として追加したと仮定します。

コーパスには、フィルタリング用のメタデータとして定義された4つのフィールドがあります：年、監督、評価、およびジャンル

```python
from langchain.chains import ConversationalRetrievalChain
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import FakeEmbeddings
from langchain_community.vectorstores import Vectara
from langchain_core.documents import Document
from langchain_openai import OpenAI
from langchain_text_splitters import CharacterTextSplitter
```

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "science fiction"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "year": 1979,
            "rating": 9.9,
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
        },
    ),
]

vectara = Vectara()
for doc in docs:
    vectara.add_texts(
        [doc.page_content],
        embedding=FakeEmbeddings(size=768),
        doc_metadata=doc.metadata,
    )
```

## セルフクエリリトリーバーの作成

次に、リトリーバーをインスタンス化します。これを行うには、ドキュメントがサポートするメタデータフィールドとドキュメント内容の簡単な説明についての情報を提供する必要があります。

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string or list[string]",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="director",
        description="The name of the movie director",
        type="string",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectara, document_content_description, metadata_field_info, verbose=True
)
```

## テスト

そして、実際にリトリーバーを使用してみましょう！

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'lang': 'eng', 'offset': '0', 'len': '66', 'year': '1993', 'rating': '7.7', 'genre': 'science fiction', 'source': 'langchain'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'lang': 'eng', 'offset': '0', 'len': '116', 'year': '2006', 'director': 'Satoshi Kon', 'rating': '8.6', 'source': 'langchain'}),
 Document(page_content='Leo DiCaprio gets lost in a dream within a dream within a dream within a ...', metadata={'lang': 'eng', 'offset': '0', 'len': '76', 'year': '2010', 'director': 'Christopher Nolan', 'rating': '8.2', 'source': 'langchain'}),
 Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'lang': 'eng', 'offset': '0', 'len': '82', 'year': '2019', 'director': 'Greta Gerwig', 'rating': '8.3', 'source': 'langchain'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'lang': 'eng', 'offset': '0', 'len': '116', 'year': '2006', 'director': 'Satoshi Kon', 'rating': '8.6', 'source': 'langchain'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'lang': 'eng', 'offset': '0', 'len': '82', 'year': '2019', 'director': 'Greta Gerwig', 'rating': '8.3', 'source': 'langchain'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'})]
```

## フィルター k

セルフクエリリトリーバーを使用して、取得するドキュメントの数を指定することもできます。

これを行うには、コンストラクタに `enable_limit=True` を渡します。

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectara,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```

```python
# This example only specifies a relevant query
retriever.invoke("what are two movies about dinosaurs")
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'lang': 'eng', 'offset': '0', 'len': '66', 'year': '1993', 'rating': '7.7', 'genre': 'science fiction', 'source': 'langchain'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'})]
```
