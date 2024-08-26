---
translated: true
---

# rag-conversation-zep

このテンプレートは、Zepを使ってRAGコンバーセーションアプリを構築する方法を示しています。

このテンプレートには以下が含まれています:
- [Zep Document Collection](https://docs.getzep.com/sdk/documents/)にドキュメントのセットを入力する方法。
- Zepの[統合された埋め込み](https://docs.getzep.com/deployment/embeddings/)機能を使ってドキュメントをベクトルとして埋め込む方法。
- ハードウェアアクセラレーションされた[Maximal Marginal Relevance](https://docs.getzep.com/sdk/search_query/) (MMR)再ランキングを使ってドキュメントを検索するためのLangChain [ZepVectorStore Retriever](https://docs.getzep.com/sdk/documents/)の設定方法。
- RAGコンバーセーションアプリを構築するために必要なプロンプト、簡単なチャット履歴データ構造、その他のコンポーネント。
- RAGコンバーセーションチェーン。

## [Zep - LLMアプリ構築のための高速でスケーラブルなビルディングブロック](https://www.getzep.com/)について

Zepは、LLMアプリを本番環境に移行するためのオープンソースプラットフォームです。LangChainやLlamaIndexで作成したプロトタイプ、またはカスタムアプリを、コードを書き換えることなく数分でプロダクション環境に移行できます。

主な機能:

- 高速! Zepの非同期抽出器はチャットループから独立して動作するため、スムーズなユーザー体験を提供します。
- 長期的なメモリの永続化。要約戦略に関係なく、過去のメッセージにアクセスできます。
- 設定可能なメッセージウィンドウに基づいたメッセージの自動要約。複数の要約が保存されるため、将来の要約戦略に柔軟性があります。
- メタデータとメモリの両方を対象とした複合検索。メッセージは作成時に自動的に埋め込まれます。
- メッセージからエンティティを自動的に抽出し、メッセージメタデータに格納するエンティティ抽出器。
- メモリと要約のトークンカウントの自動化。プロンプトの組み立てをより細かく制御できます。
- Python およびJavaScript SDK。

Zepプロジェクト: https://github.com/getzep/zep | ドキュメント: https://docs.getzep.com/

## 環境設定

[クイックスタートガイド](https://docs.getzep.com/deployment/quickstart/)に従ってZepサービスを設定してください。

## ドキュメントのZepコレクションへの取り込み

`python ingest.py`を実行して、テストドキュメントをZepコレクションに取り込みます。コレクション名とドキュメントソースを変更するには、ファイルを確認してください。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U "langchain-cli[serve]"
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-conversation-zep
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add rag-conversation-zep
```

そして、`server.py`ファイルに以下のコードを追加してください:

```python
from rag_conversation_zep import chain as rag_conversation_zep_chain

add_routes(app, rag_conversation_zep_chain, path="/rag-conversation-zep")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[こちら](https://smith.langchain.com/)からLangSmithに登録できます。
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

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレート一覧を確認できます。
[http://127.0.0.1:8000/rag-conversation-zep/playground](http://127.0.0.1:8000/rag-conversation-zep/playground)からPlaygroundにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-conversation-zep")
```
