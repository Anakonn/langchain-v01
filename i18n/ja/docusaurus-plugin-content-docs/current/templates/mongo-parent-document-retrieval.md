---
translated: true
---

# mongo-parent-document-retrieval

このテンプレートは、MongoDBとOpenAIを使ってRAGを実行します。
これは、親文書検索と呼ばれる、より高度な形式のRAGです。

この検索形式では、まず大きな文書を中サイズのチャンクに分割します。
そこから、それらの中サイズのチャンクをさらに小さなチャンクに分割します。
小さなチャンクのエンベディングを作成します。
クエリが入力されると、そのクエリのエンベディングを作成し、小さなチャンクと比較します。
ただし、小さなチャンクを直接LLMに渡すのではなく、小さなチャンクが由来した中サイズのチャンクを渡します。
これにより、より細かな検索が可能になりますが、より大きなコンテキスト(生成時に役立つ)も渡すことができます。

## 環境設定

2つの環境変数をエクスポートする必要があります。1つはMongoDBのURIで、もう1つはOpenAIのAPIキーです。
MongoDBのURIがない場合は、下の「Mongoのセットアップ」セクションの説明に従ってください。

```shell
export MONGO_URI=...
export OPENAI_API_KEY=...
```

## 使用方法

このパッケージを使用するには、LangChainのCLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package mongo-parent-document-retrieval
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add mongo-parent-document-retrieval
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from mongo_parent_document_retrieval import chain as mongo_parent_document_retrieval_chain

add_routes(app, mongo_parent_document_retrieval_chain, path="/mongo-parent-document-retrieval")
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

既にMongoSearchIndexに接続したい場合は、`mongo_parent_document_retrieval/chain.py`の接続詳細を編集してください。
親文書検索では異なるインデックス戦略を使用するため、新しいセットアップを実行する必要があります。

このディレクトリ内にいる場合は、次のように直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドは[http://127.0.0.1:8000/mongo-parent-document-retrieval/playground](http://127.0.0.1:8000/mongo-parent-document-retrieval/playground)でアクセスできます。

コードからテンプレートにアクセスするには、次のように実行します:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/mongo-parent-document-retrieval")
```

詳細については、[このノートブック](https://colab.research.google.com/drive/1cr2HBAHyBmwKUerJq2if0JaNhy-hIq7I#scrollTo=TZp7_CBfxTOB)を参照してください。

## MongoDBのセットアップ

MongoDBのアカウントを設定し、データを取り込む必要がある場合は、このステップを使用してください。
まず、標準のMongoDB Atlas セットアップ手順[ここ](https://www.mongodb.com/docs/atlas/getting-started/)に従います。

1. アカウントを作成する(まだ行っていない場合)
2. 新しいプロジェクトを作成する(まだ行っていない場合)
3. MongoDB URIを見つける。

これは、デプロイメントの概要ページに移動し、データベースに接続することで行えます。

使用可能なドライバーを確認すると、URIが表示されます。

それを環境変数として設定しましょう:

```shell
export MONGO_URI=...
```

4. OpenAIの環境変数も設定しましょう(LLMとして使用します)。

```shell
export OPENAI_API_KEY=...
```

5. データを取り込みましょう! このディレクトリに移動し、`ingest.py`のコードを実行することで行えます。例:

```shell
python ingest.py
```

データは好きなものに変更できます(そうすべきです)。

6. データにベクトルインデックスを設定する必要があります。

まず、データベースがあるクラスターに接続します。

すべてのコレクションが表示されるページに移動します。

目的のコレクションを見つけ、そのコレクションの検索インデックスを確認します。

おそらく空になっているので、新しいインデックスを作成する必要があります。

JSONエディターを使用して作成し、次のJSONを貼り付けます:

```text
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "doc_level": [
        {
          "type": "token"
        }
      ],
      "embedding": {
        "dimensions": 1536,
        "similarity": "cosine",
        "type": "knnVector"
      }
    }
  }
}
```

「次へ」をクリックし、「検索インデックスの作成」をクリックします。少し時間がかかりますが、データ上にインデックスが作成されます。
