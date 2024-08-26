---
translated: true
---

# rag-aws-bedrock

このテンプレートは、AWS Bedrock サービスに接続するように設計されています。AWS Bedrock は、一連の基礎モデルを提供する管理されたサーバーです。

主に `Anthropic Claude` をテキスト生成に、`Amazon Titan` をテキストエンベディングに、FAISSをベクトルストアとして使用しています。

RAGパイプラインの詳細については、[このノートブック](https://github.com/aws-samples/amazon-bedrock-workshop/blob/main/03_QuestionAnswering/01_qa_w_rag_claude.ipynb)を参照してください。

## 環境設定

このパッケージを使用する前に、`boto3`がAWSアカウントと連携するように設定する必要があります。

`boto3`の設定方法の詳細については、[このページ](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html#configuration)を参照してください。

さらに、FAISSベクトルストアを使用するには、`faiss-cpu`パッケージをインストールする必要があります:

```bash
pip install faiss-cpu
```

また、使用するAWSプロファイルとリージョン(デフォルトの`us-east-1`以外を使用する場合)を反映するように、以下の環境変数を設定する必要があります:

* `AWS_DEFAULT_REGION`
* `AWS_PROFILE`

## 使用方法

まず、LangChain CLIをインストールします:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、このパッケージをインストールします:

```shell
langchain app new my-app --package rag-aws-bedrock
```

既存のプロジェクトにこのパッケージを追加する場合:

```shell
langchain app add rag-aws-bedrock
```

次に、`server.py`ファイルに以下のコードを追加します:

```python
from rag_aws_bedrock import chain as rag_aws_bedrock_chain

add_routes(app, rag_aws_bedrock_chain, path="/rag-aws-bedrock")
```

(オプション) LangSmithにアクセスできる場合は、LangChainアプリケーションのトレース、モニタリング、デバッグを設定できます。アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のコマンドでLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000)でローカルサーバーが起動します。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で、プレイグラウンドは[http://127.0.0.1:8000/rag-aws-bedrock/playground](http://127.0.0.1:8000/rag-aws-bedrock/playground)でアクセスできます。

コードからテンプレートにアクセスするには:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-aws-bedrock")
```
