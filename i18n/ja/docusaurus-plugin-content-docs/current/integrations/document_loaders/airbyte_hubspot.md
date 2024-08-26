---
translated: true
---

# Airbyte Hubspot (非推奨)

注意: `AirbyteHubspotLoader`は非推奨となりました。代わりに [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte)を使用してください。

>[Airbyte](https://github.com/airbytehq/airbyte)は、APIやデータベース、ファイルからデータウェアハウスやデータレイクへのELTパイプラインのためのデータ統合プラットフォームです。データウェアハウスやデータベースへのELTコネクタのカタログが最も大きいです。

このローダーは、Hubspotコネクタをドキュメントローダーとして公開し、さまざまなHubspotオブジェクトをドキュメントとしてロードできるようにします。

## インストール

まず、`airbyte-source-hubspot`Pythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  airbyte-source-hubspot
```

## 例

リーダーの設定方法の詳細については、[Airbyteのドキュメントページ](https://docs.airbyte.com/integrations/sources/hubspot/)を確認してください。
設定オブジェクトが準拠するJSONスキーマは、Githubで確認できます: [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-hubspot/source_hubspot/spec.yaml](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-hubspot/source_hubspot/spec.yaml)。

一般的な形式は次のようになります:

```python
{
  "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
  "credentials": {
    "credentials_title": "Private App Credentials",
    "access_token": "<access token of your private app>"
  }
}
```

デフォルトでは、すべてのフィールドがドキュメントのメタデータに格納され、テキストは空の文字列に設定されます。リーダーが返すドキュメントを変換することで、ドキュメントのテキストを構築します。

```python
from langchain_community.document_loaders.airbyte import AirbyteHubspotLoader

config = {
    # your hubspot configuration
}

loader = AirbyteHubspotLoader(
    config=config, stream_name="products"
)  # check the documentation linked above for a list of all streams
```

これで、通常の方法でドキュメントをロードできます。

```python
docs = loader.load()
```

`load`は一覧を返すため、すべてのドキュメントがロードされるまでブロックします。このプロセスをより細かく制御するには、イテレータを返す`lazy_load`メソッドを使用することもできます:

```python
docs_iterator = loader.lazy_load()
```

デフォルトでは、ページコンテンツは空で、メタデータオブジェクトにレコードからのすべての情報が含まれています。ドキュメントを処理するには、ベースローダーを継承するクラスを作成し、`_handle_records`メソッドを自分で実装してください:

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)


loader = AirbyteHubspotLoader(
    config=config, record_handler=handle_record, stream_name="products"
)
docs = loader.load()
```

## 増分ロード

一部のストリームでは増分ロードが可能です。これは、ソースが同期されたレコードを追跡し、それらを再度ロードしないことを意味します。これは、データ量が多く、頻繁に更新されるソースに役立ちます。

これを活用するには、ローダーの`last_state`プロパティを保存し、ローダーを再作成する際に渡してください。これにより、新しいレコードのみがロードされるようになります。

```python
last_state = loader.last_state  # store safely

incremental_loader = AirbyteHubspotLoader(
    config=config, stream_name="products", state=last_state
)

new_docs = incremental_loader.load()
```
