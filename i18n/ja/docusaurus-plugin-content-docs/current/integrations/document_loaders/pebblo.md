---
translated: true
---

# Pebblo Safe DocumentLoader

> [Pebblo](https://daxa-ai.github.io/pebblo/)は、コンプライアンスとセキュリティの要件を心配することなく、Gen AIアプリをデプロイメントに進めることができるよう、開発者がデータを安全にロードできるようにします。このプロジェクトは、ロードされたデータに含まれるセマンティックトピックとエンティティを識別し、UIまたはPDFレポートにサマリーを表示します。

Pebbloには2つのコンポーネントがあります。

1. Langchain用Pebblo Safe DocumentLoader
1. Pebblo Server

このドキュメントでは、Gen-AIランチェーンアプリケーションにインジェストされるトピックとエンティティのタイプに関する深い可視性を得るために、既存のLangchainドキュメントローダーにPebblo Safe DocumentLoaderを組み込む方法について説明します。 `Pebblo Server`の詳細については、この[pebblo server](https://daxa-ai.github.io/pebblo/daemon)ドキュメントを参照してください。

Pebblo Safeloaderは、Langchain `DocumentLoader`のための安全なデータインジェストを可能にします。これは、ドキュメントローダーの呼び出しを`Pebblo Safe DocumentLoader`でラップすることで行われます。

注意: pebbloのデフォルト(localhost:8000)以外のURLでpebbloサーバーを設定する場合は、正しいURLを`PEBBLO_CLASSIFIER_URL`環境変数に設定してください。これは、`classifier_url`キーワード引数を使って設定することもできます。参照: [server-configurations](https://daxa-ai.github.io/pebblo/config)

#### ドキュメントロードをPebbleで有効にする方法

Langchain RAGアプリケーションのスニペットで、CSVドキュメントを読み込むために`CSVLoader`を使っていると仮定します。

ここに、`CSVLoader`を使ったドキュメントロードのスニペットがあります。

```python
from langchain.document_loaders.csv_loader import CSVLoader

loader = CSVLoader("data/corp_sens_data.csv")
documents = loader.load()
print(documents)
```

Pebblo SafeLoaderは、上記のスニペットにいくつかのコード変更を加えることで有効にできます。

```python
from langchain.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
)
documents = loader.load()
print(documents)
```

### Pebbloクラウドサーバーにセマンティックトピックと識別子を送信する

セマンティックデータをpebblo-cloudに送信するには、api-keyをPebbloSafeLoaderの引数として渡すか、`PEBBLO_API_KEY`環境変数にapi-keyを設定します。

```python
from langchain.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
    api_key="my-api-key",  # API key (Optional, can be set in the environment variable PEBBLO_API_KEY)
)
documents = loader.load()
print(documents)
```

### ロードされたメタデータにセマンティックトピックと識別子を追加する

ロードされたドキュメントのメタデータにセマンティックトピックとセマンティックエンティティを追加するには、引数として`load_semantic=True`を渡すか、新しい環境変数`PEBBLO_LOAD_SEMANTIC`を定義し、Trueに設定します。

```python
from langchain.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import PebbloSafeLoader

loader = PebbloSafeLoader(
    CSVLoader("data/corp_sens_data.csv"),
    name="acme-corp-rag-1",  # App name (Mandatory)
    owner="Joe Smith",  # Owner (Optional)
    description="Support productivity RAG application",  # Description (Optional)
    api_key="my-api-key",  # API key (Optional, can be set in the environment variable PEBBLO_API_KEY)
    load_semantic=True,  # Load semantic data (Optional, default is False, can be set in the environment variable PEBBLO_LOAD_SEMANTIC)
)
documents = loader.load()
print(documents[0].metadata)
```
