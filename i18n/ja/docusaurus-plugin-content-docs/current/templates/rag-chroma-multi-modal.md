---
translated: true
---

# rag-chroma-multi-modal

マルチモーダルなLLMにより、画像に関する質問応答を行うことができる視覚アシスタントが可能になります。

このテンプレートは、グラフや図などの視覚的要素を含むスライドデッキ用の視覚アシスタントを作成します。

OpenCLIPエンベディングを使用して、すべてのスライド画像をエンベディングし、Chromaに格納します。

質問が与えられると、関連するスライドが検索され、GPT-4Vに渡されて回答が合成されます。

## Input

`/docs`ディレクトリにPDFのスライドデッキを用意してください。

デフォルトでは、このテンプレートにはDataDogという公開企業の第3四半期決算に関するスライドデッキが含まれています。

質問の例は以下のとおりです:

```text
How many customers does Datadog have?
What is Datadog platform % Y/Y growth in FY20, FY21, and FY22?
```

スライドデッキのインデックスを作成するには、以下を実行します:

```shell
poetry install
python ingest.py
```

## Storage

このテンプレートでは、[OpenCLIP](https://github.com/mlfoundations/open_clip)マルチモーダルエンベディングを使用して画像をエンベディングします。

さまざまなエンベディングモデルオプションを選択できます(結果は[こちら](https://github.com/mlfoundations/open_clip/blob/main/docs/openclip_results.csv))を参照)。

アプリを初めて実行すると、マルチモーダルエンベディングモデルが自動的にダウンロードされます。

デフォルトでは、LangChainは、メモリ要件が低い「ViT-H-14」というパフォーマンスが中程度のモデルを使用します。

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

アプリは、テキスト入力と画像の両方をマルチモーダルエンベディング空間にマッピングし、類似性に基づいて画像を検索します。その後、画像をGPT-4Vに渡します。

## 環境設定

OpenAI GPT-4Vにアクセスするには、`OPENAI_API_KEY`環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、LangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、このパッケージのみをインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-chroma-multi-modal
```

既存のプロジェクトに追加する場合は、以下を実行します:

```shell
langchain app add rag-chroma-multi-modal
```

そして、`server.py`ファイルに以下のコードを追加します:

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

このディレクトリ内にいる場合は、以下のようにLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-chroma-multi-modal/playground](http://127.0.0.1:8000/rag-chroma-multi-modal/playground)からPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-multi-modal")
```
