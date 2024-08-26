---
translated: true
---

# rag-multi-modal-mv-local

視覚検索は、iPhoneやAndroidデバイスを持つ多くの人にとって馴染みのあるアプリケーションです。これにより、ユーザーは自然言語を使って写真を検索することができます。

オープンソースの多モーダルLLMの登場により、自分の個人的な写真コレクションに対してこのようなアプリケーションを構築することが可能になりました。

このテンプレートは、自分の写真コレクションに対して、プライベートな視覚検索と質問応答を行う方法を示しています。

オープンソースの多モーダルLLMを使用して、各写真の要約を作成し、それらを埋め込んでChromaに保存します。

質問が与えられると、関連する写真が検索され、多モーダルLLMに渡されて回答が合成されます。

## Input

`/docs`ディレクトリに写真のセットを用意してください。

デフォルトでは、このテンプレートには3枚の食べ物の写真が用意されています。

アプリは、提供されたキーワードや質問に基づいて、写真を検索して要約します。

```text
What kind of ice cream did I have?
```

実際には、より大きな写真コーパスをテストすることができます。

画像のインデックスを作成するには、以下を実行します:

```shell
poetry install
python ingest.py
```

## Storage

このテンプレートが使用するプロセスは以下の通りです (ブログ(https://blog.langchain.dev/multi-modal-rag-template/))を参照):

* 一連の画像が与えられると
* ローカルの多モーダルLLM ([bakllava](https://ollama.ai/library/bakllava))) を使用して、各画像の要約を作成します
* 元の画像へのリンクとともに、画像要約を埋め込みます
* ユーザーの質問が与えられると、画像要約とユーザー入力の類似性 (Ollama埋め込みを使用) に基づいて、関連する画像を検索します
* それらの画像をbakllavaに渡して回答を合成します

デフォルトでは、[LocalFileStore](https://python.langchain.com/docs/integrations/stores/file_system)を使用して画像を保存し、Chromaを使用して要約を保存します。

## LLMとEmbeddingモデル

画像の要約、埋め込み、最終的な画像QAには[Ollama](https://python.langchain.com/docs/integrations/chat/ollama#multi-modal)を使用します。

最新バージョンのOllamaをダウンロードしてください: https://ollama.ai/

オープンソースの多モーダルLLMを取得してください: e.g., https://ollama.ai/library/bakllava

オープンソースの埋め込みモデルを取得してください: e.g., https://ollama.ai/library/llama2:7b

```shell
ollama pull bakllava
ollama pull llama2:7b
```

デフォルトでは`bakllava`に設定されていますが、`chain.py`と`ingest.py`で異なるダウンロードしたモデルに変更できます。

アプリは、テキスト入力と画像要約の類似性に基づいて画像を検索し、それらの画像を`bakllava`に渡します。

## Usage

このパッケージを使用するには、LangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-multi-modal-mv-local
```

既存のプロジェクトに追加する場合は、以下を実行してください:

```shell
langchain app add rag-multi-modal-mv-local
```

そして、`server.py`ファイルに以下のコードを追加してください:

```python
from rag_multi_modal_mv_local import chain as rag_multi_modal_mv_local_chain

add_routes(app, rag_multi_modal_mv_local_chain, path="/rag-multi-modal-mv-local")
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

このディレクトリ内にいる場合は、以下のように直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-multi-modal-mv-local/playground](http://127.0.0.1:8000/rag-multi-modal-mv-local/playground)でPlaygroundにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-multi-modal-mv-local")
```
