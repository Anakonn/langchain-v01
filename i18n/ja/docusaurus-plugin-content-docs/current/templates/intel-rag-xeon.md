---
translated: true
---

# Intel Xeon上のRAGの例

このテンプレートは、Intel® Xeon® Scalable Processorでのクロマと文章生成推論を使ったRAGを実行します。
Intel® Xeon® Scalable プロセッサは、より高いコアあたりのパフォーマンスと並外れたAIパフォーマンスを実現する組み込みアクセラレータを備えており、最も需要の高いワークロードの要件に対応するための高度なセキュリティ技術を提供しています。同時に、最大のクラウドの選択肢と、アプリケーションの移植性を提供しています。詳細は[Intel® Xeon® Scalable Processors](https://www.intel.com/content/www/us/en/products/details/processors/xeon/scalable.html)をご確認ください。

## 環境設定

[🤗 text-generation-inference](https://github.com/huggingface/text-generation-inference)をIntel® Xeon® Scalable Processorsで使用するには、以下の手順に従ってください:

### Intel Xeonサーバーでローカルサーバーインスタンスを起動します:

```bash
model=Intel/neural-chat-7b-v3-3
volume=$PWD/data # share a volume with the Docker container to avoid downloading weights every run

docker run --shm-size 1g -p 8080:80 -v $volume:/data ghcr.io/huggingface/text-generation-inference:1.4 --model-id $model
```

`LLAMA-2`のようなゲートモデルの場合は、上記のdockerrunコマンドに-e HUGGING_FACE_HUB_TOKEN=\<token\>を渡す必要があります。有効なHugging Face Hubの読み取りトークンを使用してください。

[huggingface token](https://huggingface.co/docs/hub/security-tokens)のリンクに従って、アクセストークンを取得し、`HUGGINGFACEHUB_API_TOKEN`環境変数にトークンをエクスポートしてください。

```bash
export HUGGINGFACEHUB_API_TOKEN=<token>
```

エンドポイントが機能しているかどうかをチェックするリクエストを送信します:

```bash
curl localhost:8080/generate -X POST -d '{"inputs":"Which NFL team won the Super Bowl in the 2010 season?","parameters":{"max_new_tokens":128, "do_sample": true}}'   -H 'Content-Type: application/json'
```

詳細については、[text-generation-inference](https://github.com/huggingface/text-generation-inference)を参照してください。

## データの入力

サンプルデータを入力したい場合は、以下のコマンドを実行できます:

```shell
poetry install
poetry run python ingest.py
```

このスクリプトは、Nike `nke-10k-2023.pdf`のEdgar 10k filingデータのセクションを処理し、Chromaデータベースに格納します。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package intel-rag-xeon
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add intel-rag-xeon
```

そして、`server.py`ファイルに以下のコードを追加してください:

```python
from intel_rag_xeon import chain as xeon_rag_chain

add_routes(app, xeon_rag_chain, path="/intel-rag-xeon")
```

(オプション) LangSmithを設定しましょう。LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。[ここ](https://smith.langchain.com/)からLangSmithに登録できます。アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のようにLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000)でローカルサーバーが起動します。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/intel-rag-xeon/playground](http://127.0.0.1:8000/intel-rag-xeon/playground)からPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/intel-rag-xeon")
```
