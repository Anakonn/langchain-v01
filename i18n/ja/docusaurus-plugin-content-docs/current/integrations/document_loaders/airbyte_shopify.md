---
translated: true
---

# Airbyte Shopify (非推奨)

注意: このコネクタ固有のローダーは非推奨となりました。代わりに[`AirbyteLoader`](/docs/integrations/document_loaders/airbyte)を使用してください。

>[Airbyte](https://github.com/airbytehq/airbyte)はELTパイプラインのためのデータ統合プラットフォームで、APIやデータベース、ファイルからデータウェアハウスやレイクへのコネクタを最も多く持っています。

このローダーはShopifyコネクタをドキュメントローダーとして公開し、さまざまなShopifyオブジェクトをドキュメントとしてロードできるようにします。

## インストール

まず、`airbyte-source-shopify`Pythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  airbyte-source-shopify
```

## 例

設定方法の詳細については、[Airbyteのドキュメントページ](https://docs.airbyte.com/integrations/sources/shopify/)を確認してください。
設定オブジェクトのJSONスキーマは、Githubで確認できます: [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-shopify/source_shopify/spec.json](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-shopify/source_shopify/spec.json)。

一般的な形式は以下のようになります:

```python
{
    "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
    "shop": "<name of the shop you want to retrieve documents from>",
    "credentials": {
        "auth_method": "api_password",
        "api_password": "<your api password>"
    }
}
```

デフォルトでは、すべてのフィールドがドキュメントのメタデータに格納され、テキストは空の文字列に設定されます。リーダーが返すドキュメントを変換することで、ドキュメントのテキストを構築できます。

```python
from langchain_community.document_loaders.airbyte import AirbyteShopifyLoader

config = {
    # your shopify configuration
}

loader = AirbyteShopifyLoader(
    config=config, stream_name="orders"
)  # check the documentation linked above for a list of all streams
```

通常の方法でドキュメントをロードできます。

```python
docs = loader.load()
```

`load`はリストを返すため、すべてのドキュメントがロードされるまでブロックします。プロセスをより細かく制御するには、`lazy_load`メソッドを使用することもできます。これはイテレータを返します。

```python
docs_iterator = loader.lazy_load()
```

デフォルトでは、ページのコンテンツは空で、メタデータオブジェクトにレコードからのすべての情報が含まれています。ドキュメントを別の形式で作成するには、ローダーの作成時に`record_handler`関数を渡します。

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)


loader = AirbyteShopifyLoader(
    config=config, record_handler=handle_record, stream_name="orders"
)
docs = loader.load()
```

## 増分ロード

一部のストリームでは増分ロードが可能です。これは、ソースが同期されたレコードを追跡し、それらを再度ロードしないことを意味します。これは、データ量が多く、頻繁に更新されるソースに役立ちます。

これを活用するには、ローダーの`last_state`プロパティを保存し、ローダーを再作成する際に渡します。これにより、新しいレコードのみがロードされます。

```python
last_state = loader.last_state  # store safely

incremental_loader = AirbyteShopifyLoader(
    config=config, stream_name="orders", state=last_state
)

new_docs = incremental_loader.load()
```
