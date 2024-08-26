---
translated: true
---

# Apify Dataset

>[Apify Dataset](https://docs.apify.com/platform/storage/dataset)は、製品リストやGoogle SERPなどの構造化されたウェブスクレイピング結果を保存し、JSONやCSV、Excelなどの様々な形式にエクスポートするための、スケーラブルな順次アクセス可能な保存場所です。データセットは主に[Apify Actors](https://apify.com/store)—ウェブスクレイピング、クロール、データ抽出などの様々なユースケースのためのサーバーレスクラウドプログラム—の結果を保存するために使用されます。

このノートブックでは、LangChainにApifyデータセットをロードする方法を示します。

## 前提条件

Apifyプラットフォーム上に既存のデータセットが必要です。まだデータセットがない場合は、[このノートブック](/docs/integrations/tools/apify)を確認して、ドキュメント、ナレッジベース、ヘルプセンター、ブログなどからコンテンツを抽出する方法を確認してください。

```python
%pip install --upgrade --quiet  apify-client
```

まず、ソースコードに`ApifyDatasetLoader`をインポートします:

```python
from langchain_community.document_loaders import ApifyDatasetLoader
from langchain_core.documents import Document
```

次に、ApifyデータセットのレコードフィールドをLangChain `Document`形式にマッピングする関数を提供します。

例えば、データセットのアイテムが以下のように構造化されている場合:

```json
{
    "url": "https://apify.com",
    "text": "Apify is the best web scraping and automation platform."
}
```

以下のコードのマッピング関数は、それらをLangChain `Document`形式に変換します。これにより、任意のLLMモデル(質問応答など)で使用できるようになります。

```python
loader = ApifyDatasetLoader(
    dataset_id="your-dataset-id",
    dataset_mapping_function=lambda dataset_item: Document(
        page_content=dataset_item["text"], metadata={"source": dataset_item["url"]}
    ),
)
```

```python
data = loader.load()
```

## 質問応答の例

この例では、データセットのデータを使用して質問に答えます。

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.docstore.document import Document
from langchain_community.document_loaders import ApifyDatasetLoader
```

```python
loader = ApifyDatasetLoader(
    dataset_id="your-dataset-id",
    dataset_mapping_function=lambda item: Document(
        page_content=item["text"] or "", metadata={"source": item["url"]}
    ),
)
```

```python
index = VectorstoreIndexCreator().from_loaders([loader])
```

```python
query = "What is Apify?"
result = index.query_with_sources(query)
```

```python
print(result["answer"])
print(result["sources"])
```

```output
 Apify is a platform for developing, running, and sharing serverless cloud programs. It enables users to create web scraping and automation tools and publish them on the Apify platform.

https://docs.apify.com/platform/actors, https://docs.apify.com/platform/actors/running/actors-in-store, https://docs.apify.com/platform/security, https://docs.apify.com/platform/actors/examples
```
