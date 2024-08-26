---
translated: true
---

# Chain-of-Note (Wikipedia)

Wikipediaに記載されているChain-of-Noteを実装しています。Yu et al.によるhttps://arxiv.org/pdf/2311.09210.pdfで説明されているものです。

ここで使用されているプロンプトを確認してください。https://smith.langchain.com/hub/bagatur/chain-of-note-wiki

## 環境設定

Anthropic claude-3-sonnet-20240229 chatモデルを使用しています。Anthropic APIキーを設定してください。

```bash
export ANTHROPIC_API_KEY="..."
```

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります。

```shell
pip install -U "langchain-cli[serve]"
```

新しいLangChainプロジェクトを作成し、このパッケージのみをインストールするには、以下のように実行できます。

```shell
langchain app new my-app --package chain-of-note-wiki
```

既存のプロジェクトに追加する場合は、以下のように実行できます。

```shell
langchain app add chain-of-note-wiki
```

そして、`server.py`ファイルに以下のコードを追加してください。

```python
from chain_of_note_wiki import chain as chain_of_note_wiki_chain

add_routes(app, chain_of_note_wiki_chain, path="/chain-of-note-wiki")
```

(オプション) LangSmithを設定しましょう。
LangSmithはLangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
LangSmithの登録は[こちら](https://smith.langchain.com/)から行えます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のように直接LangServeインスタンスを起動できます。

```shell
langchain serve
```

これにより、FastAPIアプリケーションが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドは[http://127.0.0.1:8000/chain-of-note-wiki/playground](http://127.0.0.1:8000/chain-of-note-wiki/playground)からアクセスできます。

コードからテンプレートにアクセスするには、以下のようにします。

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/chain-of-note-wiki")
```
