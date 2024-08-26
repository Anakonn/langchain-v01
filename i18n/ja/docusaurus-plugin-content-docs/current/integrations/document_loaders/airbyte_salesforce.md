---
translated: true
---

# Airbyte Salesforce (非推奨)

注意: このコネクタ固有のローダーは非推奨となっています。代わりに[`AirbyteLoader`](/docs/integrations/document_loaders/airbyte)を使用してください。

>[Airbyte](https://github.com/airbytehq/airbyte)はELTパイプラインのためのデータ統合プラットフォームで、APIやデータベース、ファイルからデータウェアハウスやレイクへのコネクタを最も多く持っています。

このローダーはSalesforceコネクタをドキュメントローダーとして公開し、さまざまなSalesforceオブジェクトをドキュメントとしてロードできるようにします。

## インストール

まず、`airbyte-source-salesforce`Pythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  airbyte-source-salesforce
```

## 例

設定方法の詳細については、[Airbyteのドキュメントページ](https://docs.airbyte.com/integrations/sources/salesforce/)を確認してください。
設定オブジェクトのJSONスキーマはGitHubで確認できます: [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-salesforce/source_salesforce/spec.yaml](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-salesforce/source_salesforce/spec.yaml)。

一般的な形式は以下のようになります:

```python
{
  "client_id": "<oauth client id>",
  "client_secret": "<oauth client secret>",
  "refresh_token": "<oauth refresh token>",
  "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
  "is_sandbox": False, # set to True if you're using a sandbox environment
  "streams_criteria": [ # Array of filters for salesforce objects that should be loadable
    {"criteria": "exacts", "value": "Account"}, # Exact name of salesforce object
    {"criteria": "starts with", "value": "Asset"}, # Prefix of the name
    # Other allowed criteria: ends with, contains, starts not with, ends not with, not contains, not exacts
  ],
}
```

デフォルトでは、すべてのフィールドがドキュメントのメタデータに格納され、テキストは空の文字列に設定されます。リーダーが返すドキュメントを変換することで、ドキュメントのテキストを構築できます。

```python
from langchain_community.document_loaders.airbyte import AirbyteSalesforceLoader

config = {
    # your salesforce configuration
}

loader = AirbyteSalesforceLoader(
    config=config, stream_name="asset"
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

デフォルトでは、ページコンテンツは空で、メタデータオブジェクトにはレコードからのすべての情報が含まれています。ドキュメントを別の形式で作成するには、ローダーの作成時に`record_handler`関数を渡します。

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)


loader = AirbyteSalesforceLoader(
    config=config, record_handler=handle_record, stream_name="asset"
)
docs = loader.load()
```

## 増分ロード

一部のストリームでは増分ロードが可能です。これは、ソースが同期されたレコードを追跡し、それらを再度ロードしないことを意味します。これは、データ量が多く、頻繁に更新されるソースに役立ちます。

これを活用するには、ローダーの`last_state`プロパティを保存し、ローダーを再作成する際に渡します。これにより、新しいレコードのみがロードされます。

```python
last_state = loader.last_state  # store safely

incremental_loader = AirbyteSalesforceLoader(
    config=config, stream_name="asset", state=last_state
)

new_docs = incremental_loader.load()
```
