---
translated: true
---

# Azure AI Search

[Azure AI Search](https://learn.microsoft.com/azure/search/search-what-is-azure-search) (以前は `Azure Cognitive Search` として知られていました) は、ベクトル、キーワード、およびハイブリッドクエリの情報検索のためのインフラストラクチャ、API、およびツールを開発者に提供するMicrosoftのクラウド検索サービスです。

`AzureAISearchRetriever` は、非構造化クエリからドキュメントを返す統合モジュールです。これは BaseRetriever クラスに基づいており、Azure AI Search の 2023-11-01 安定 REST API バージョンをターゲットにしているため、ベクトルインデックスおよびクエリをサポートしています。

このモジュールを使用するには、以下が必要です：

+ Azure AI Search サービス。Azure トライアルにサインアップすると [無料で作成](https://learn.microsoft.com/azure/search/search-create-service-portal) できます。無料サービスには低いクォータがありますが、このノートブックのコードを実行するには十分です。

+ ベクトルフィールドを含む既存のインデックス。これを作成する方法はいくつかあり、その中には [ベクトルストアモジュール](../vectorstores/azuresearch.md) を使用する方法があります。または、[Azure AI Search REST APIs を試す](https://learn.microsoft.com/azure/search/search-get-started-vector) こともできます。

+ APIキー。検索サービスを作成するとAPIキーが生成されます。インデックスをクエリするだけの場合は、クエリAPIキーを使用できます。それ以外の場合は、管理者APIキーを使用してください。詳細は [APIキーの見つけ方](https://learn.microsoft.com/azure/search/search-security-api-keys?tabs=rest-use%2Cportal-find%2Cportal-query#find-existing-keys) を参照してください。

`AzureAISearchRetriever` は `AzureCognitiveSearchRetriever` を置き換えるもので、後者はまもなく廃止されます。最新の安定版検索APIに基づく新しいバージョンへの切り替えをお勧めします。

## パッケージのインストール

azure-documents-search パッケージ 11.4 以降を使用してください。

```python
%pip install --upgrade --quiet langchain
%pip install --upgrade --quiet langchain-openai
%pip install --upgrade --quiet  azure-search-documents
%pip install --upgrade --quiet  azure-identity
```

## 必要なライブラリをインポートする

```python
import os

from langchain_community.retrievers import (
    AzureAISearchRetriever,
)
```

## 検索設定を構成する

検索サービス名、インデックス名、およびAPIキーを環境変数として設定します（または、`AzureAISearchRetriever` への引数として渡すこともできます）。検索インデックスは検索可能なコンテンツを提供します。

```python
os.environ["AZURE_AI_SEARCH_SERVICE_NAME"] = "<YOUR_SEARCH_SERVICE_NAME>"
os.environ["AZURE_AI_SEARCH_INDEX_NAME"] = "<YOUR_SEARCH_INDEX_NAME>"
os.environ["AZURE_AI_SEARCH_API_KEY"] = "<YOUR_API_KEY>"
```

## リトリーバーを作成する

`AzureAISearchRetriever` の場合、`index_name`、`content_key`、および取得したい結果数を設定する `top_k` を指定します。`top_k` をゼロ（デフォルト）に設定すると、すべての結果が返されます。

```python
retriever = AzureAISearchRetriever(
    content_key="content", top_k=1, index_name="langchain-vector-demo"
)
```

これで、Azure AI Search からドキュメントを取得することができます。
これがそれを行うためのメソッドです。クエリに関連するすべてのドキュメントが返されます。

```python
retriever.invoke("here is my unstructured query string")
```

## 例

このセクションでは、組み込みのサンプルデータを使用してリトリーバーを使用する方法を示します。すでに検索サービスにベクトルインデックスがある場合は、このステップをスキップできます。

まず、エンドポイントとキーを提供します。このステップでベクトルインデックスを作成するため、テキストのベクトル表現を取得するためのテキスト埋め込みモデルを指定します。この例では、text-embedding-ada-002 のデプロイメントを持つ Azure OpenAI を想定しています。このステップでインデックスを作成するため、検索サービスの管理者APIキーを必ず使用してください。

```python
import os

from langchain.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import TokenTextSplitter
from langchain.vectorstores import AzureSearch
from langchain_community.retrievers import AzureAISearchRetriever
from langchain_openai import AzureOpenAIEmbeddings, OpenAIEmbeddings

os.environ["AZURE_AI_SEARCH_SERVICE_NAME"] = "<YOUR_SEARCH_SERVICE_NAME>"
os.environ["AZURE_AI_SEARCH_INDEX_NAME"] = "langchain-vector-demo"
os.environ["AZURE_AI_SEARCH_API_KEY"] = "<YOUR_SEARCH_SERVICE_ADMIN_API_KEY>"
azure_endpoint: str = "<YOUR_AZURE_OPENAI_ENDPOINT>"
azure_openai_api_key: str = "<YOUR_AZURE_OPENAI_API_KEY>"
azure_openai_api_version: str = "2023-05-15"
azure_deployment: str = "text-embedding-ada-002"
```

ドキュメントをベクトルに変換し、Azure AI Search ベクトルストアに保存するために、Azure OpenAI の埋め込みモデルを使用します。また、インデックス名を `langchain-vector-demo` に設定します。これにより、そのインデックス名に関連付けられた新しいベクトルストアが作成されます。

```python
embeddings = AzureOpenAIEmbeddings(
    model=azure_deployment,
    azure_endpoint=azure_endpoint,
    openai_api_key=azure_openai_api_key,
)

vector_store: AzureSearch = AzureSearch(
    embedding_function=embeddings.embed_query,
    azure_search_endpoint=os.getenv("AZURE_AI_SEARCH_SERVICE_NAME"),
    azure_search_key=os.getenv("AZURE_AI_SEARCH_API_KEY"),
    index_name="langchain-vector-demo",
)
```

次に、新しく作成したベクトルストアにデータをロードします。この例では、`state_of_the_union.txt` ファイルをロードします。テキストをオーバーラップのない400トークンチャンクに分割します。最後に、ドキュメントがベクトルとしてベクトルストアに追加されます。

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt", encoding="utf-8")

documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=400, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

vector_store.add_documents(documents=docs)
```

次に、リトリーバーを作成します。現在の `index_name` 変数は、前のステップの `langchain-vector-demo` です。ベクトルストアの作成をスキップした場合は、パラメータにインデックス名を指定してください。このクエリでは、トップの結果が返されます。

```python
retriever = AzureAISearchRetriever(
    content_key="content", top_k=1, index_name="langchain-vector-demo"
)
```

これで、アップロードしたドキュメントからクエリに関連するデータを取得できます。

```python
retriever.invoke("does the president have a plan for covid-19?")
```
