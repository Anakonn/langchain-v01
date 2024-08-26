---
translated: true
---

# Bedrock JCVD 🕺🥋

## 概要

[Anthropic's Claude on Amazon Bedrock](https://aws.amazon.com/bedrock/claude/)を使用して、JCVDのようにふるまうLangChainテンプレートです。

> 私はチャットボットのフレッド・アステアです! 🕺

## 環境設定

### AWS 認証情報

このテンプレートは[Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)、AWSのPythonSDKを使用して[Amazon Bedrock](https://aws.amazon.com/bedrock/)を呼び出します。リクエストを行うには、AWS認証情報と*AWS リージョン*の両方を設定する必要があります。

> 方法については、[AWS Boto3 ドキュメンテーション](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html)（開発者ガイド > 認証情報）を参照してください。

### 基盤モデル

デフォルトでは、このテンプレートは[Anthropic's Claude v2](https://aws.amazon.com/about-aws/whats-new/2023/08/claude-2-foundation-model-anthropic-amazon-bedrock/)(`anthropic.claude-v2`)を使用します。

> 特定のモデルへのアクセスをリクエストするには、[Amazon Bedrock ユーザーガイド](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html)（モデルアクセス）を確認してください。

別のモデルを使用するには、環境変数`BEDROCK_JCVD_MODEL_ID`を設定します。利用可能なベースモデルのリストは、[Amazon Bedrock ユーザーガイド](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids-arns.html)（APIの使用 > APIオペレーション > 推論の実行 > ベースモデルID）にあります。

> 利用可能なモデル（ベースモデルと[カスタムモデル](https://docs.aws.amazon.com/bedrock/latest/userguide/custom-models.html))を含む）の完全なリストは、[Amazon Bedrock コンソール](https://docs.aws.amazon.com/bedrock/latest/userguide/using-console.html)の**基盤モデル**セクションや、[`aws bedrock list-foundation-models`](https://docs.aws.amazon.com/cli/latest/reference/bedrock/list-foundation-models.html)コマンドで確認できます。

## 使用方法

このパッケージを使用するには、LangChainCLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package bedrock-jcvd
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add bedrock-jcvd
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from bedrock_jcvd import chain as bedrock_jcvd_chain

add_routes(app, bedrock_jcvd_chain, path="/bedrock-jcvd")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[ここ](https://smith.langchain.com/)からLangSmithに登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、次のようにLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。

[http://127.0.0.1:8000/bedrock-jcvd/playground](http://127.0.0.1:8000/bedrock-jcvd/playground)からplaygroundにアクセスできます。
