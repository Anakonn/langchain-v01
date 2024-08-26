---
translated: true
---

# Airbyte Gong (非推奨)

注意: このコネクタ固有のローダーは非推奨となっています。代わりに [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) を使用してください。

>[Airbyte](https://github.com/airbytehq/airbyte) は、APIやデータベース、ファイルからデータウェアハウスやデータレイクへのELTパイプラインのためのデータ統合プラットフォームです。データウェアハウスやデータベースへのELTコネクタのカタログが最も大きいです。

このローダーは、Gongコネクタをドキュメントローダーとして公開し、さまざまなGongオブジェクトをドキュメントとしてロードできるようにします。

## インストール

まず、`airbyte-source-gong` Pythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  airbyte-source-gong
```

## 例

リーダーの設定方法の詳細については、[Airbyteのドキュメントページ](https://docs.airbyte.com/integrations/sources/gong/)を確認してください。
設定オブジェクトが準拠するJSONスキーマは、Github上で確認できます: [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-gong/source_gong/spec.yaml](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-gong/source_gong/spec.yaml)。

一般的な形式は次のようになります:

```python
{
  "access_key": "<access key name>",
  "access_key_secret": "<access key secret>",
  "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
}
```

デフォルトでは、すべてのフィールドがドキュメントのメタデータに格納され、テキストは空の文字列に設定されます。リーダーによって返されるドキュメントを変換することで、ドキュメントのテキストを構築します。

```python
from langchain_community.document_loaders.airbyte import AirbyteGongLoader

config = {
    # your gong configuration
}

loader = AirbyteGongLoader(
    config=config, stream_name="calls"
)  # check the documentation linked above for a list of all streams
```

通常の方法でドキュメントをロードできます。

```python
docs = loader.load()
```

`load`は一覧を返すため、すべてのドキュメントがロードされるまでブロックします。このプロセスをより細かく制御するには、イテレータを返す`lazy_load`メソッドを使用することもできます:

```python
docs_iterator = loader.lazy_load()
```

デフォルトでは、ページコンテンツは空で、メタデータオブジェクトにはレコードからのすべての情報が含まれています。ドキュメントを処理するには、ベースローダーを継承するクラスを作成し、`_handle_records`メソッドを自分で実装します:

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)


loader = AirbyteGongLoader(
    config=config, record_handler=handle_record, stream_name="calls"
)
docs = loader.load()
```

## 増分ロード

一部のストリームでは増分ロードが可能で、ソースが同期されたレコードを追跡し、それらを再びロードしないようになっています。これは、データ量が多く、頻繁に更新されるソースに役立ちます。

これを活用するには、ローダーの`last_state`プロパティを保存し、ローダーを再作成する際に渡します。これにより、新しいレコードのみがロードされるようになります。

```python
last_state = loader.last_state  # store safely

incremental_loader = AirbyteGongLoader(
    config=config, stream_name="calls", state=last_state
)

new_docs = incremental_loader.load()
```
