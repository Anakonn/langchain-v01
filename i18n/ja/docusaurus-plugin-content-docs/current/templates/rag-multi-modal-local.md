---
translated: true
---

# rag-multi-modal-local

視覚検索は、iPhoneやAndroidデバイスを持つ多くの人にとって馴染みのあるアプリケーションです。これにより、ユーザーは自然言語を使って写真を検索できます。

オープンソースの多モーダルLLMの登場により、自分の個人的な写真コレクションに対してこのようなアプリケーションを構築することが可能になりました。

このテンプレートは、自分の写真コレクションに対して、プライベートな視覚検索と質問応答を行う方法を示しています。

OpenCLIPエンベディングを使用して、すべての写真をエンベディングし、Chromaに保存しています。

質問が与えられると、関連する写真が検索され、オープンソースの多モーダルLLMに渡されて、回答が合成されます。

## Input

`/docs`ディレクトリに写真のセットを用意してください。

デフォルトでは、このテンプレートには3枚の食べ物の写真が用意されています。

質問の例は以下のとおりです:

```text
What kind of soft serve did I have?
```

実際には、より大きな写真コーパスをテストできます。

画像のインデックスを作成するには、以下を実行します:

```shell
poetry install
python ingest.py
```

## Storage

このテンプレートでは、[OpenCLIP](https://github.com/mlfoundations/open_clip)の多モーダルエンベディングを使用して、画像をエンベディングします。

さまざまなエンベディングモデルオプションを選択できます (結果は[こちら](https://github.com/mlfoundations/open_clip/blob/main/docs/openclip_results.csv))を参照)。

アプリを初めて実行すると、自動的にマルチモーダルエンベディングモデルがダウンロードされます。

デフォルトでは、LangChainは、メモリ要件が低い「ViT-H-14」というモデルを使用します。

`rag_chroma_multi_modal/ingest.py`で、代替の`OpenCLIPEmbeddings`モデルを選択できます:

```python
vectorstore_mmembd = Chroma(
    collection_name="multi-modal-rag",
    persist_directory=str(re_vectorstore_path),
    embedding_function=OpenCLIPEmbeddings(
        model_name="ViT-H-14", checkpoint="laion2b_s32b_b79k"
    ),
)
```

## LLM

このテンプレートでは、[Ollama](https://python.langchain.com/docs/integrations/chat/ollama#multi-modal)を使用します。

最新バージョンのOllamaをダウンロードしてください: https://ollama.ai/

オープンソースの多モーダルLLMをプルしてください: e.g., https://ollama.ai/library/bakllava

```shell
ollama pull bakllava
```

デフォルトでは`bakllava`に設定されていますが、`chain.py`と`ingest.py`で異なるダウンロードしたモデルに変更できます。

## Usage

このパッケージを使用するには、LangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-chroma-multi-modal
```

既存のプロジェクトに追加する場合は、以下を実行してください:

```shell
langchain app add rag-chroma-multi-modal
```

そして、`server.py`ファイルに以下のコードを追加してください:

```python
from rag_chroma_multi_modal import chain as rag_chroma_multi_modal_chain

add_routes(app, rag_chroma_multi_modal_chain, path="/rag-chroma-multi-modal")
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

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-chroma-multi-modal/playground](http://127.0.0.1:8000/rag-chroma-multi-modal/playground)でPlaygroundにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-multi-modal")
```
