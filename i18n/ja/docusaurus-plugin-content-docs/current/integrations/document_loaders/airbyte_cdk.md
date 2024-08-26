---
translated: true
---

# Airbyte CDK (非推奨)

注意: `AirbyteCDKLoader` は非推奨となりました。代わりに [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) を使用してください。

>[Airbyte](https://github.com/airbytehq/airbyte) は、API、データベース、ファイルからデータウェアハウスやレイクへのELTパイプラインのためのデータ統合プラットフォームです。データウェアハウスやデータベースへの最大のELTコネクタカタログを持っています。

多くのソースコネクタは [Airbyte CDK](https://docs.airbyte.com/connector-development/cdk-python/) を使って実装されています。このローダーを使うと、これらのコネクタを実行し、データをドキュメントとして返すことができます。

## インストール

まず、`airbyte-cdk` Pythonパッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  airbyte-cdk
```

次に、[Airbyte GitHubリポジトリ](https://github.com/airbytehq/airbyte/tree/master/airbyte-integrations/connectors)から既存のコネクタをインストールするか、[Airbyte CDK](https://docs.airbyte.io/connector-development/connector-development)を使ってご自身のコネクタを作成してください。

例えば、Githubコネクタをインストールするには、次のように実行します。

```python
%pip install --upgrade --quiet  "source_github@git+https://github.com/airbytehq/airbyte.git@master#subdirectory=airbyte-integrations/connectors/source-github"
```

一部のソースは PyPI 上の通常のパッケージとしても公開されています。

## 例

次に、インポートしたソースに基づいて `AirbyteCDKLoader` を作成できます。これには `config` オブジェクトが必要で、これがコネクタに渡されます。また、レコードを取得したいストリームの名前 (`stream_name`) を選択する必要があります。 `config` オブジェクトと利用可能なストリームの詳細については、コネクタのドキュメントページとspec定義を確認してください。Githubコネクタの場合は以下のようになります:

* [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-github/source_github/spec.json](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-github/source_github/spec.json)
* [https://docs.airbyte.com/integrations/sources/github/](https://docs.airbyte.com/integrations/sources/github/)

```python
from langchain_community.document_loaders.airbyte import AirbyteCDKLoader
from source_github.source import SourceGithub  # plug in your own source here

config = {
    # your github configuration
    "credentials": {"api_url": "api.github.com", "personal_access_token": "<token>"},
    "repository": "<repo>",
    "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
}

issues_loader = AirbyteCDKLoader(
    source_class=SourceGithub, config=config, stream_name="issues"
)
```

通常の方法でドキュメントをロードできます。

```python
docs = issues_loader.load()
```

`load` は list を返すため、すべてのドキュメントがロードされるまでブロックします。プロセスをより細かく制御したい場合は、`lazy_load` メソッドを使うこともできます。これはイテレータを返します。

```python
docs_iterator = issues_loader.lazy_load()
```

デフォルトでは、ページコンテンツは空で、メタデータオブジェクトにレコードからのすべての情報が含まれています。ドキュメントを別の形式で作成するには、ローダー作成時に `record_handler` 関数を渡します。

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(
        page_content=record.data["title"] + "\n" + (record.data["body"] or ""),
        metadata=record.data,
    )


issues_loader = AirbyteCDKLoader(
    source_class=SourceGithub,
    config=config,
    stream_name="issues",
    record_handler=handle_record,
)

docs = issues_loader.load()
```

## 増分ロード

一部のストリームでは増分ロードが可能です。これは、ソースが同期済みのレコードを追跡し、それらを再びロードしないことを意味します。高容量のデータが頻繁に更新されるソースで便利です。

これを活用するには、ローダーの `last_state` プロパティを保存し、ローダーを再作成する際にそれを渡します。これにより、新しいレコードのみがロードされます。

```python
last_state = issues_loader.last_state  # store safely

incremental_issue_loader = AirbyteCDKLoader(
    source_class=SourceGithub, config=config, stream_name="issues", state=last_state
)

new_docs = incremental_issue_loader.load()
```
