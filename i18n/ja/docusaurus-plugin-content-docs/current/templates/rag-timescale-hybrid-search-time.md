---
translated: true
---

# タイムスケールベクトルを使ったRAGによるハイブリッド検索

このテンプレートでは、timescale-vectorとself-query retrieverを使ってシミラリティーと時間に基づくハイブリッド検索を行う方法を示しています。
これは、データに強い時間的要素がある場合に役立ちます。そのようなデータの例は以下のようなものです:
- ニュース記事(政治、ビジネスなど)
- ブログ記事、ドキュメントその他の公開資料(公開または非公開)
- ソーシャルメディアの投稿
- あらゆる種類のチェンジログ
- メッセージ

このようなアイテムは、類似性と時間の両方で検索されることが多いです。例えば:2022年のトヨタトラックに関するすべてのニュースを表示する。

[Timescale Vector](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)は、時間範囲内の埋め込みを検索する際の性能を向上させます。これは、特定の時間範囲のデータを分離するための自動テーブルパーティショニングを活用することで実現しています。

LangChainのself-query retrieverは、ユーザーのクエリのテキストから時間範囲(およびその他の検索条件)を推論することができます。

## Timescale Vectorとは?

**[Timescale Vector](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)は、AIアプリケーション向けのPostgreSQL++です。**

Timescale Vectorにより、`PostgreSQL`内で数十億のベクトル埋め込みを効率的に保存およびクエリできるようになります。
- DiskANN inspired indexing algorithmにより、`pgvector`よりも高速かつ正確なシミラリティ検索を1B+ベクトルで実現します。
- 自動的なタイムベースのパーティショニングとインデックス化により、時間ベースのベクトル検索を高速化します。
- ベクトル埋め込みと関係データをSQL インターフェースでクエリできます。

Timescale Vectorは、POCから本番環境まで拡張できるクラウドPostgreSQLです:
- 関係メタデータ、ベクトル埋め込み、時系列データを単一のデータベースに保存できるため、運用が簡素化されます。
- ストリーミングバックアップ、レプリケーション、高可用性、行レベルセキュリティなどのエンタープライズグレードの機能を備えた堅牢なPostgreSQLの基盤を活用できます。
- エンタープライズグレードのセキュリティとコンプライアンスにより、心配なく利用できます。

### Timescale Vectorにアクセスする方法

Timescale Vectorは[Timescale](https://www.timescale.com/products?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)のクラウドPostgreSQLプラットフォームで利用できます。(現時点では自己ホスト版はありません。)

- LangChainユーザーは、Timescale Vectorの90日間無料トライアルを利用できます。
- 開始するには、[サインアップ](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)してTimescaleにデータベースを作成し、このノートブックに従ってください。
- Pythonでのタイムスケールベクトルの使用方法の詳細は、[インストール手順](https://github.com/timescale/python-vector)を参照してください。

## 環境設定

このテンプレートはTimescale Vectorをベクトルストアとして使用し、`TIMESCALES_SERVICE_URL`を設定する必要があります。アカウントがまだない場合は、[ここ](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)から90日間の無料トライアルにサインアップしてください。

サンプルデータセットを読み込むには、`LOAD_SAMPLE_DATA=1`を設定します。独自のデータセットを読み込む場合は、以下のセクションを参照してください。

OpenAIモデルにアクセスするには、`OPENAI_API_KEY`環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、LangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-timescale-hybrid-search-time
```

既存のプロジェクトに追加する場合は、以下を実行するだけです:

```shell
langchain app add rag-timescale-hybrid-search-time
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from rag_timescale_hybrid_search.chain import chain as rag_timescale_hybrid_search_chain

add_routes(app, rag_timescale_hybrid_search_chain, path="/rag-timescale-hybrid-search")
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

このディレクトリ内にいる場合は、以下のようにLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレート一覧を確認できます。
[http://127.0.0.1:8000/rag-timescale-hybrid-search/playground](http://127.0.0.1:8000/rag-timescale-hybrid-search/playground)からPlaygroundにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-timescale-hybrid-search")
```

## 独自のデータセットの読み込み

独自のデータセットを読み込むには、`chain.py`の`DATASET SPECIFIC CODE`セクションのコードを変更する必要があります。
このコードでは、コレクションの名称、データの読み込み方法、およびコレクションの内容とすべてのメタデータの人間可読の説明を定義しています。人間可読の説明は、self-query retrieverがLLMにクエリをメタデータのフィルターに変換するのに使用されます。
