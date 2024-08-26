---
translated: true
---

# self-query-qdrant

このテンプレートは、Qdrantと OpenAIを使用して[self-querying](https://python.langchain.com/docs/modules/data_connection/retrievers/self_query/)を実行します。デフォルトでは、10個の人工データセットを使用しますが、独自のデータセットに置き換えることができます。

## 環境設定

OpenAIモデルにアクセスするには、`OPENAI_API_KEY`環境変数を設定してください。

`QDRANT_URL`を、QdrantインスタンスのURLに設定してください。[Qdrant Cloud](https://cloud.qdrant.io)を使用する場合は、`QDRANT_API_KEY`環境変数も設定する必要があります。これらのいずれも設定しない場合、テンプレートは`http://localhost:6333`のローカルQdrantインスタンスに接続しようとします。

```shell
export QDRANT_URL=
export QDRANT_API_KEY=

export OPENAI_API_KEY=
```

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U "langchain-cli[serve]"
```

新しいLangChainプロジェクトを作成し、このパッケージを唯一のパッケージとしてインストールします:

```shell
langchain app new my-app --package self-query-qdrant
```

既存のプロジェクトに追加するには、次のように実行します:

```shell
langchain app add self-query-qdrant
```

### デフォルト

サーバーを起動する前に、Qdrantコレクションを作成し、ドキュメントをインデックス化する必要があります。
次のコマンドを実行して行うことができます:

```python
from self_query_qdrant.chain import initialize

initialize()
```

`app/server.py`ファイルに次のコードを追加します:

```python
from self_query_qdrant.chain import chain

add_routes(app, chain, path="/self-query-qdrant")
```

デフォルトのデータセットには、料理、価格、レストラン情報の10個のドキュメントが含まれています。
ドキュメントは`packages/self-query-qdrant/self_query_qdrant/defaults.py`ファイルにあります。
ドキュメントの1つは次のようになっています:

```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html", "title": "self-query-qdrant"}]-->
from langchain_core.documents import Document

Document(
    page_content="Spaghetti with meatballs and tomato sauce",
    metadata={
        "price": 12.99,
        "restaurant": {
            "name": "Olive Garden",
            "location": ["New York", "Chicago", "Los Angeles"],
        },
    },
)
```

self-queryingを使うと、メタデータに基づいてフィルタリングしながら、ドキュメントに対してセマンティック検索を実行できます。
例えば、$15未満の料理でニューヨークで提供されているものを検索できます。

### カスタマイズ

上記の例はすべて、デフォルト設定でテンプレートを起動することを前提としています。
テンプレートをカスタマイズする場合は、`app/server.py`ファイルの`create_chain`関数にパラメーターを渡すことができます:

```python
<!--IMPORTS:[{"imported": "Cohere", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.cohere.Cohere.html", "title": "self-query-qdrant"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "self-query-qdrant"}, {"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.schema", "docs": "https://api.python.langchain.com/en/latest/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "self-query-qdrant"}]-->
from langchain_community.llms import Cohere
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains.query_constructor.schema import AttributeInfo

from self_query_qdrant.chain import create_chain

chain = create_chain(
    llm=Cohere(),
    embeddings=HuggingFaceEmbeddings(),
    document_contents="Descriptions of cats, along with their names and breeds.",
    metadata_field_info=[
        AttributeInfo(name="name", description="Name of the cat", type="string"),
        AttributeInfo(name="breed", description="Cat's breed", type="string"),
    ],
    collection_name="cats",
)
```

ドキュメントを作成してインデックス化する`initialize`関数についても同様です:

```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html", "title": "self-query-qdrant"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "self-query-qdrant"}]-->
from langchain_core.documents import Document
from langchain_community.embeddings import HuggingFaceEmbeddings

from self_query_qdrant.chain import initialize

initialize(
    embeddings=HuggingFaceEmbeddings(),
    collection_name="cats",
    documents=[
        Document(
            page_content="A mean lazy old cat who destroys furniture and eats lasagna",
            metadata={"name": "Garfield", "breed": "Tabby"},
        ),
        ...
    ]
)
```

このテンプレートは柔軟性があり、簡単に異なるドキュメントセットで使用できます。

### LangSmith

(オプション) LangSmithにアクセスできる場合は、LangChainアプリケーションのトレース、モニタリング、デバッグに使用できるよう設定してください。アクセスできない場合は、このセクションをスキップしてください。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、次のようにして直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

### ローカルサーバー

これにより、[http://localhost:8000](http://localhost:8000)でローカルに実行されるFastAPIアプリが起動します。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます
プレイグラウンドは[http://127.0.0.1:8000/self-query-qdrant/playground](http://127.0.0.1:8000/self-query-qdrant/playground)でアクセスできます

コードからテンプレートにアクセスするには:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/self-query-qdrant")
```
