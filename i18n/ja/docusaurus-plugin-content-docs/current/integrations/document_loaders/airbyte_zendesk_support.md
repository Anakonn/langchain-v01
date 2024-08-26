---
translated: true
---

# Airbyte Zendesk Support (非推奨)

注意: このコネクター固有のローダーは非推奨となりました。代わりに [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) を使用してください。

>[Airbyte](https://github.com/airbytehq/airbyte) は、APIやデータベース、ファイルからデータウェアハウスやデータレイクへのELTパイプラインのためのデータ統合プラットフォームです。データウェアハウスやデータベースへの最大のELTコネクターカタログを持っています。

このローダーは、Zendesk Supportコネクターをドキュメントローダーとして公開し、さまざまなオブジェクトをドキュメントとしてロードできるようにします。

## インストール

まず、`airbyte-source-zendesk-support` Pythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  airbyte-source-zendesk-support
```

## 例

リーダーの設定方法の詳細については、[Airbyteのドキュメントページ](https://docs.airbyte.com/integrations/sources/zendesk-support/)を確認してください。
設定オブジェクトが準拠するJSONスキーマは、Github上で確認できます: [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-zendesk-support/source_zendesk_support/spec.json](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-zendesk-support/source_zendesk_support/spec.json)。

一般的な形式は次のようになります:

```python
{
  "subdomain": "<your zendesk subdomain>",
  "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
  "credentials": {
    "credentials": "api_token",
    "email": "<your email>",
    "api_token": "<your api token>"
  }
}
```

デフォルトでは、すべてのフィールドがドキュメントのメタデータに格納され、テキストは空の文字列に設定されます。リーダーによって返されるドキュメントを変換することで、ドキュメントのテキストを作成します。

```python
from langchain_community.document_loaders.airbyte import AirbyteZendeskSupportLoader

config = {
    # your zendesk-support configuration
}

loader = AirbyteZendeskSupportLoader(
    config=config, stream_name="tickets"
)  # check the documentation linked above for a list of all streams
```

これで、通常の方法でドキュメントをロードできます。

```python
docs = loader.load()
```

`load`は一覧を返すため、すべてのドキュメントがロードされるまでブロックします。このプロセスをより細かく制御するには、イテレーターを返す`lazy_load`メソッドを使用することもできます:

```python
docs_iterator = loader.lazy_load()
```

デフォルトでは、ページコンテンツは空で、メタデータオブジェクトにはレコードからのすべての情報が含まれています。ドキュメントを別の方法で作成するには、ローダーの作成時に`record_handler`関数を渡します:

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)


loader = AirbyteZendeskSupportLoader(
    config=config, record_handler=handle_record, stream_name="tickets"
)
docs = loader.load()
```

## 増分ロード

一部のストリームでは増分ロードが可能で、ソースが同期されたレコードを追跡し、それらを再度ロードしないようになっています。これは、データ量が多く、頻繁に更新されるソースに役立ちます。

これを活用するには、ローダーの`last_state`プロパティを保存し、ローダーを再作成する際に渡します。これにより、新しいレコードのみがロードされるようになります。

```python
last_state = loader.last_state  # store safely

incremental_loader = AirbyteZendeskSupportLoader(
    config=config, stream_name="tickets", state=last_state
)

new_docs = incremental_loader.load()
```
