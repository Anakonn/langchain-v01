---
translated: true
---

# Apify

このノートブックでは、LangChainの[Apify統合](/docs/integrations/providers/apify)の使用方法を示します。

[Apify](https://apify.com)は、ウェブスクレイピングとデータ抽出のためのクラウドプラットフォームであり、
さまざまなウェブスクレイピング、クロール、およびデータ抽出のユースケースに対応する
千以上の既製アプリ「*Actors*」の[エコシステム](https://apify.com/store)を提供します。
たとえば、Google検索結果、InstagramやFacebookのプロフィール、AmazonやShopifyの商品、Googleマップのレビューなどを抽出するために使用できます。

この例では、[Website Content Crawler](https://apify.com/apify/website-content-crawler) Actorを使用します。
このActorは、ドキュメント、ナレッジベース、ヘルプセンター、ブログなどのウェブサイトを深くクロールし、
ウェブページからテキストコンテンツを抽出できます。次に、ドキュメントをベクターインデックスに入力し、そこから質問に答えます。

```python
%pip install --upgrade --quiet  apify-client langchain-openai langchain
```

まず、`ApifyWrapper`をソースコードにインポートします。

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.utilities import ApifyWrapper
from langchain_core.documents import Document
```

[Apify APIトークン](https://console.apify.com/account/integrations)を使用して初期化し、この例の目的のためにOpenAI APIキーも使用します。

```python
import os

os.environ["OPENAI_API_KEY"] = "Your OpenAI API key"
os.environ["APIFY_API_TOKEN"] = "Your Apify API token"

apify = ApifyWrapper()
```

次にActorを実行し、終了を待って、ApifyデータセットからLangChainドキュメントローダーに結果を取得します。

すでにApifyデータセットにいくつかの結果がある場合は、[このノートブック](/docs/integrations/document_loaders/apify_dataset)に示されているように、`ApifyDatasetLoader`を使用して直接ロードできます。このノートブックでは、ApifyデータセットのレコードのフィールドをLangChainの`Document`フィールドにマッピングするために使用される`dataset_mapping_function`の説明も見つけることができます。

```python
loader = apify.call_actor(
    actor_id="apify/website-content-crawler",
    run_input={"startUrls": [{"url": "https://python.langchain.com/en/latest/"}]},
    dataset_mapping_function=lambda item: Document(
        page_content=item["text"] or "", metadata={"source": item["url"]}
    ),
)
```

クロールされたドキュメントからベクターインデックスを初期化します。

```python
index = VectorstoreIndexCreator().from_loaders([loader])
```

最後に、ベクターインデックスにクエリを実行します。

```python
query = "What is LangChain?"
result = index.query_with_sources(query)
```

```python
print(result["answer"])
print(result["sources"])
```

```output
 LangChain is a standard interface through which you can interact with a variety of large language models (LLMs). It provides modules that can be used to build language model applications, and it also provides chains and agents with memory capabilities.

https://python.langchain.com/en/latest/modules/models/llms.html, https://python.langchain.com/en/latest/getting_started/getting_started.html
```
