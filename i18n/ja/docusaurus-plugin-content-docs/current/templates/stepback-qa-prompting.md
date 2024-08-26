---
translated: true
---

# stepback-qa-prompting

このテンプレートは、複雑な質問に対するパフォーマンスを向上させる「ステップバック」プロンプティング手法を複製したものです。

この手法は、元の質問とステップバック質問の両方で検索を行うことで、通常の質問回答アプリケーションと組み合わせることができます。

この手法の詳細については、[こちらの論文](https://arxiv.org/abs/2310.06117)と Cobus Greyling による優れたブログ記事[こちら](https://cobusgreyling.medium.com/a-new-prompt-engineering-technique-has-been-introduced-called-step-back-prompting-b00e8954cacb)をご覧ください。

このテンプレートでは、チャットモデルでより良く機能するようにプロンプトを少し変更しています。

## 環境設定

OpenAI モデルにアクセスするには、`OPENAI_API_KEY` 環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、まず LangChain CLI をインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しい LangChain プロジェクトを作成し、このパッケージのみをインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package stepback-qa-prompting
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add stepback-qa-prompting
```

そして、`server.py` ファイルに以下のコードを追加してください:

```python
from stepback_qa_prompting.chain import chain as stepback_qa_prompting_chain

add_routes(app, stepback_qa_prompting_chain, path="/stepback-qa-prompting")
```

(オプション) LangSmith を設定しましょう。
LangSmith は LangChain アプリケーションのトレース、モニタリング、デバッグを支援します。
LangSmith に登録するには[こちら](https://smith.langchain.com/)からサインアップできます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のコマンドで直接 LangServe インスタンスを起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000)でローカルサーバーが起動します。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレート一覧を、[http://127.0.0.1:8000/stepback-qa-prompting/playground](http://127.0.0.1:8000/stepback-qa-prompting/playground)でプレイグラウンドにアクセスできます。

コードからテンプレートにアクセスするには、以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/stepback-qa-prompting")
```
