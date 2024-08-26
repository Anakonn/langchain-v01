---
translated: true
---

# nvidia-rag-canonical

このテンプレートは、Milvus Vector StoreとNVIDIAモデル(EmbeddingおよびChat)を使用してRAGを実行します。

## 環境設定

NVIDIA APIキーを環境変数としてエクスポートする必要があります。
NVIDIA APIキーをお持ちでない場合は、以下の手順に従って作成できます:
1. [NVIDIA GPU Cloud](https://catalog.ngc.nvidia.com/)サービスでフリーアカウントを作成します。このサービスはAIソリューションカタログ、コンテナ、モデルなどをホストしています。
2. `Catalog > AI Foundation Models > (APIエンドポイントを持つモデル)`に移動します。
3. `API`オプションを選択し、`Generate Key`をクリックします。
4. 生成されたキーを`NVIDIA_API_KEY`として保存します。これで、エンドポイントにアクセスできるようになります。

```shell
export NVIDIA_API_KEY=...
```

Milvus Vector Storeのホスト設定については、下部のセクションを参照してください。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

NVIDIA モデルを使用するには、Langchain NVIDIA AI Endpointsパッケージをインストールします:

```shell
pip install -U langchain_nvidia_aiplay
```

新しいLangChainプロジェクトを作成し、このパッケージのみをインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package nvidia-rag-canonical
```

既存のプロジェクトに追加する場合は、以下を実行します:

```shell
langchain app add nvidia-rag-canonical
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from nvidia_rag_canonical import chain as nvidia_rag_canonical_chain

add_routes(app, nvidia_rag_canonical_chain, path="/nvidia-rag-canonical")
```

取り込みパイプラインを設定する場合は、`server.py`ファイルに以下のコードを追加できます:

```python
from nvidia_rag_canonical import ingest as nvidia_rag_ingest

add_routes(app, nvidia_rag_ingest, path="/nvidia-rag-ingest")
```

取り込まれたファイルは、サーバーを再起動しないと、リトリーバーによってアクセスできないことに注意してください。

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[ここ](https://smith.langchain.com/)からLangSmithに登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Milvus Vector Storeに接続したくない場合は、下の`Milvus Setup`セクションを参照してください。

Milvus Vector Storeに接続したい場合は、`nvidia_rag_canonical/chain.py`の接続詳細を編集してください。

このディレクトリ内にいる場合は、以下のようにLangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドは[http://127.0.0.1:8000/nvidia-rag-canonical/playground](http://127.0.0.1:8000/nvidia-rag-canonical/playground)でアクセスできます。

コードからテンプレートにアクセスするには、以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/nvidia-rag-canonical")
```

## Milvus セットアップ

Milvus Vector Storeを作成し、データを取り込む必要がある場合は、この手順に従ってください。
まず、[ここ](https://milvus.io/docs/install_standalone-docker.md)のMilvus標準セットアップ手順に従います。

1. Docker Compose YAMLファイルをダウンロードします。
    ```shell
    wget https://github.com/milvus-io/milvus/releases/download/v2.3.3/milvus-standalone-docker-compose.yml -O docker-compose.yml
    ```
2. Milvus Vector Storeコンテナを起動します。
    ```shell
    sudo docker compose up -d
    ```
3. PyMilvusパッケージをインストールして、Milvusコンテナと対話できるようにします。
    ```shell
    pip install pymilvus
    ```
4. データを取り込みましょう! このディレクトリに移動し、`ingest.py`のコードを実行することで行えます:

    ```shell
    python ingest.py
    ```

    このコードは、お好みのデータを取り込むように変更できます。
