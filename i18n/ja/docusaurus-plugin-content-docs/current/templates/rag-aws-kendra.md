---
translated: true
---

# rag-aws-kendra

このテンプレートは、Amazon Kendra (機械学習ベースの検索サービス) とAnthropic Claudeのテキスト生成を利用したアプリケーションです。アプリケーションは、Retrievalチェーンを使用してドキュメントを取得し、ドキュメントからの質問に答えます。

`boto3`ライブラリを使用してBedrock serviceに接続しています。

Amazon Kendraを使ったRAGアプリケーションの構築に関する詳細は、[このページ](https://aws.amazon.com/blogs/machine-learning/quickly-build-high-accuracy-generative-ai-applications-on-enterprise-data-using-amazon-kendra-langchain-and-large-language-models/)を確認してください。

## 環境設定

`boto3`を設定し、AWS アカウントで動作するようにしてください。

[ここ](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html#configuration)のガイドに従ってください。

また、このテンプレートを使用する前に、Kendra Indexを設定する必要があります。

[このCloudformationテンプレート](https://github.com/aws-samples/amazon-kendra-langchain-extensions/blob/main/kendra_retriever_samples/kendra-docs-index.yaml)を使用して、サンプルのインデックスを作成できます。

これには、Amazon Kendra、Amazon Lex、Amazon SageMakerのAWSオンラインドキュメンテーションを含むサンプルデータが含まれています。または、独自のデータセットをインデックス化している場合は、独自のAmazon Kendraインデックスを使用することもできます。

以下の環境変数を設定する必要があります:

* `AWS_DEFAULT_REGION` - 正しいAWSリージョンを反映する必要があります。デフォルトは `us-east-1` です。
* `AWS_PROFILE` - 使用するAWSプロファイルを反映する必要があります。デフォルトは `default` です。
* `KENDRA_INDEX_ID` - KendraインデックスのインデックスIDを設定する必要があります。インデックスIDは36文字の英数字で、インデックスの詳細ページで確認できます。

## 使用方法

このパッケージを使用するには、LangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-aws-kendra
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add rag-aws-kendra
```

そして、`server.py`ファイルに以下のコードを追加してください:

```python
from rag_aws_kendra.chain import chain as rag_aws_kendra_chain

add_routes(app, rag_aws_kendra_chain, path="/rag-aws-kendra")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[ここ](https://smith.langchain.com/)でLangSmithに登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のように直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000)でローカルサーバーが起動します。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-aws-kendra/playground](http://127.0.0.1:8000/rag-aws-kendra/playground)でPlaygroundにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-aws-kendra")
```
