---
translated: true
---

# 複数のインデックス(Fusion)を持つRAG

複数のドメイン固有のリトリーバーを照会し、すべての検索結果から最も関連性の高いドキュメントを選択するQAアプリケーション。

## 環境設定

このアプリケーションは、PubMed、ArXiv、Wikipedia、および[Kay AI](https://www.kay.ai)(SEC書類用)を照会します。

無料のKay AIアカウントを作成し、[ここからAPIキーを取得](https://www.kay.ai)する必要があります。
次に環境変数を設定します:

```bash
export KAY_API_KEY="<YOUR_API_KEY>"
```

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package rag-multi-index-fusion
```

既存のプロジェクトに追加する場合は、次のように実行するだけです:

```shell
langchain app add rag-multi-index-fusion
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from rag_multi_index_fusion import chain as rag_multi_index_fusion_chain

add_routes(app, rag_multi_index_fusion_chain, path="/rag-multi-index-fusion")
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

このディレクトリ内にいる場合は、次のようにして直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-multi-index-fusion/playground](http://127.0.0.1:8000/rag-multi-index-fusion/playground)からplaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-multi-index-fusion")
```
