---
translated: true
---

# rag-gpt-crawler

GPT-クローラーは、カスタムGPTやその他のアプリ(RAG)で使用するためのファイルを生成するためにWebサイトをクロールします。

このテンプレートは[gpt-crawler](https://github.com/BuilderIO/gpt-crawler)を使用してRAGアプリを構築します。

## 環境設定

OpenAIモデルにアクセスするには、`OPENAI_API_KEY`環境変数を設定してください。

## クロール

GPT-クローラーを実行して、GPT-クローラーリポジトリのconfig fileを使用して一連のURLからコンテンツを抽出します。

LangChain使用例のドキュメントの例config:

```javascript
export const config: Config = {
  url: "https://python.langchain.com/docs/use_cases/",
  match: "https://python.langchain.com/docs/use_cases/**",
  selector: ".docMainContainer_gTbr",
  maxPagesToCrawl: 10,
  outputFileName: "output.json",
};
```

次に、[gpt-crawler](https://github.com/BuilderIO/gpt-crawler) READMEに記載されているように実行します:

```shell
npm start
```

そして、`output.json`ファイルをこのREADMEを含むフォルダにコピーします。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package rag-gpt-crawler
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add rag-gpt-crawler
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from rag_chroma import chain as rag_gpt_crawler

add_routes(app, rag_gpt_crawler, path="/rag-gpt-crawler")
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

このディレクトリ内にいる場合は、次のようにして直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-gpt-crawler/playground](http://127.0.0.1:8000/rag-gpt-crawler/playground)でplaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-gpt-crawler")
```
