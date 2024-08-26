---
translated: true
---

# Airbyte Typeform (非推奨)

注意: このコネクター固有のローダーは非推奨となっています。代わりに[`AirbyteLoader`](/docs/integrations/document_loaders/airbyte)を使用してください。

>[Airbyte](https://github.com/airbytehq/airbyte)はELTパイプラインのためのデータ統合プラットフォームで、APIやデータベース、ファイルからデータウェアハウスやレイクへのコネクタを最も多く提供しています。

このローダーはTypeformコネクタをドキュメントローダーとして公開し、さまざまなTypeformオブジェクトをドキュメントとしてロードできるようにします。

## インストール

まず、`airbyte-source-typeform`Pythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  airbyte-source-typeform
```

## 例

設定方法の詳細については、[Airbyteのドキュメントページ](https://docs.airbyte.com/integrations/sources/typeform/)を確認してください。
設定オブジェクトのJSONスキーマはGitHubで確認できます: [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-typeform/source_typeform/spec.json](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-typeform/source_typeform/spec.json)。

一般的な形式は以下のようになります:

```python
{
  "credentials": {
    "auth_type": "Private Token",
    "access_token": "<your auth token>"
  },
  "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
  "form_ids": ["<id of form to load records for>"] # if omitted, records from all forms will be loaded
}
```

デフォルトでは、すべてのフィールドがドキュメントのメタデータに格納され、テキストは空の文字列に設定されます。リーダーが返すドキュメントを変換することで、ドキュメントのテキストを作成できます。

```python
from langchain_community.document_loaders.airbyte import AirbyteTypeformLoader

config = {
    # your typeform configuration
}

loader = AirbyteTypeformLoader(
    config=config, stream_name="forms"
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

デフォルトでは、ページコンテンツは空で、メタデータオブジェクトにレコードからのすべての情報が含まれています。ドキュメントを別の形式で作成するには、ローダーの作成時に`record_handler`関数を渡します。

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)


loader = AirbyteTypeformLoader(
    config=config, record_handler=handle_record, stream_name="forms"
)
docs = loader.load()
```

## 増分ロード

一部のストリームでは増分ロードが可能です。これは、ソースが同期されたレコードを追跡し、それらを再度ロードしないことを意味します。これは、データ量が多く、頻繁に更新されるソースに役立ちます。

これを活用するには、ローダーの`last_state`プロパティを保存し、ローダーを再作成する際に渡します。これにより、新しいレコードのみがロードされます。

```python
last_state = loader.last_state  # store safely

incremental_loader = AirbyteTypeformLoader(
    config=config, record_handler=handle_record, stream_name="forms", state=last_state
)

new_docs = incremental_loader.load()
```
