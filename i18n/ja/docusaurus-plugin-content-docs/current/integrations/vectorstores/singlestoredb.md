---
translated: false
---

# SingleStoreDB

>[SingleStoreDB](https://singlestore.com/)は、[クラウド](https://www.singlestore.com/cloud/)およびオンプレミス環境の両方で優れた性能を発揮するように設計された、強力で高性能な分散SQLデータベースソリューションです。多機能なセットを備え、シームレスな展開オプションを提供しながら、比類のないパフォーマンスを実現します。

SingleStoreDBの際立った特徴は、ベクターストレージと操作の高度なサポートであり、テキスト類似性マッチングなどの複雑なAI機能を必要とするアプリケーションに最適です。[dot_product](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/dot_product.html)や[euclidean_distance](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/euclidean_distance.html)などの組み込みベクタ関数を使用することで、SingleStoreDBは開発者が効率的に高度なアルゴリズムを実装できるようにします。

SingleStoreDB内でベクターデータを活用したい開発者向けには、[ベクターデータの扱い方](https://docs.singlestore.com/managed-service/en/developer-resources/functional-extensions/working-with-vector-data.html)に関する詳細なチュートリアルが用意されています。このチュートリアルでは、SingleStoreDB内のベクターストアを紹介し、ベクター類似性に基づく検索を可能にする機能を示します。ベクターインデックスを活用することで、クエリを高速に実行し、関連するデータを迅速に取得できます。

さらに、SingleStoreDBのベクターストアは、[Luceneに基づく全文検索インデックス](https://docs.singlestore.com/cloud/developer-resources/functional-extensions/working-with-full-text-search/)とシームレスに統合され、強力なテキスト類似性検索を可能にします。ユーザーはドキュメントメタデータオブジェクトの選択されたフィールドに基づいて検索結果をフィルタリングでき、クエリの精度を向上させることができます。

SingleStoreDBの特長は、ベクター検索と全文検索をさまざまな方法で組み合わせる柔軟性と多用途性にあります。テキストやベクター類似性で事前フィルタリングを行い、最も関連性の高いデータを選択するか、加重和アプローチを使用して最終的な類似性スコアを計算するなど、開発者には多くの選択肢があります。

本質的に、SingleStoreDBは、AI駆動のアプリケーション向けに比類のないパフォーマンスと柔軟性を提供する、ベクターデータの管理とクエリの包括的なソリューションを提供します。

```python
# SingleStoreDBへの接続は、singlestoredb Pythonコネクタを通じて容易に行えます。
# このコネクタが作業環境にインストールされていることを確認してください。
%pip install --upgrade --quiet  singlestoredb
```

```python
import getpass
import os

# OpenAIEmbeddingsを使用するためにOpenAI APIキーを取得します。
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.vectorstores import SingleStoreDB
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
```

```python
# ドキュメントのロード
# この例では人工データを使用します
docs = [
    Document(
        page_content="""In the parched desert, a sudden rainstorm brought relief,
            as the droplets danced upon the thirsty earth, rejuvenating the landscape
            with the sweet scent of petrichor.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""Amidst the bustling cityscape, the rain fell relentlessly,
            creating a symphony of pitter-patter on the pavement, while umbrellas
            bloomed like colorful flowers in a sea of gray.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""High in the mountains, the rain transformed into a delicate
            mist, enveloping the peaks in a mystical veil, where each droplet seemed to
            whisper secrets to the ancient rocks below.""",
        metadata={"category": "rain"},
    ),
    Document(
        page_content="""Blanketing the countryside in a soft, pristine layer, the
            snowfall painted a serene tableau, muffling the world in a tranquil hush
            as delicate flakes settled upon the branches of trees like nature's own
            lacework.""",
        metadata={"category": "snow"},
    ),
    Document(
        page_content="""In the urban landscape, snow descended, transforming
            bustling streets into a winter wonderland, where the laughter of
            children echoed amidst the flurry of snowballs and the twinkle of
            holiday lights.""",
        metadata={"category": "snow"},
    ),
    Document(
        page_content="""Atop the rugged peaks, snow fell with an unyielding
            intensity, sculpting the landscape into a pristine alpine paradise,
            where the frozen crystals shimmered under the moonlight, casting a
            spell of enchantment over the wilderness below.""",
        metadata={"category": "snow"},
    ),
]

embeddings = OpenAIEmbeddings()
```

データベースへの[接続](https://singlestoredb-python.labs.singlestore.com/generated/singlestoredb.connect.html)を確立するには、いくつかの方法があります。環境変数を設定するか、名前付きパラメータを`SingleStoreDBコンストラクタ`に渡すことができます。また、これらのパラメータを`from_documents`および`from_texts`メソッドに提供することもできます。

```python
# 接続URLを環境変数として設定
os.environ["SINGLESTOREDB_URL"] = "root:pass@localhost:3306/db"

# ドキュメントをストアにロード
docsearch = SingleStoreDB.from_documents(
    docs,
    embeddings,
    table_name="notebook",  # カスタム名のテーブルを使用
)
```

```python
query = "trees in the snow"
docs = docsearch.similarity_search(query)  # クエリに対応するドキュメントを見つける
print(docs[0].page_content)
```

SingleStoreDBは、ユーザーがメタデータフィールドに基づいて検索結果を事前フィルタリングし、検索結果を強化および精緻化する機能を提供します。この機能により、開発者やデータアナリストはクエリを微調整し、検索結果が正確に要件に適合するようにできます。特定のメタデータ属性を使用して検索結果をフィルタリングすることで、クエリの範囲を狭め、関連するデータサブセットのみに焦点を当てることができます。

```python
query = "trees branches"
docs = docsearch.similarity_search(
    query, filter={"category": "snow"}
)  # クエリに対応し、カテゴリが"snow"のドキュメントを見つける
print(docs[0].page_content)
```

SingleStore DBバージョン8.5以上を使用することで、[ANNベクターインデックス](https://docs.singlestore.com/cloud/reference/sql-reference/vector-functions/vector-indexing/)を活用して検索効率を向上させることができます。ベクターストアオブジェクトの作成時に`use_vector_index=True`を設定することで、この機能を有効にできます。さらに、ベクターがデフォルトのOpenAI埋め込みサイズ1536と異なる場合は、`vector_size`パラメータを適切に指定することを確認してください。

SingleStoreDBは、特定のユースケースやユーザーの好みに対応するために綿密に設計された多様な検索戦略を提供します。デフォルトの`VECTOR_ONLY`戦略は、`dot_product`や`euclidean_distance`などのベクター操作を使用して、ベクター間の類似性スコアを直接計算します。一方、`TEXT_ONLY`はLuceneベースの全文検索を使用し、特にテキスト中心のアプリケーションに有利です。バランスの取れたアプローチを求めるユーザーには、`FILTER_BY_TEXT`がテキスト類似性に基づいて結果を絞り込んだ後、ベクター比較を行います。`FILTER_BY_VECTOR`はベクター類似性を優先し、最適な一致を得るためにテキスト類似性を評価する前に結果をフィルタリングします。特に`FILTER_BY_TEXT`と`FILTER_BY_VECTOR`は、動作するために全文検索インデックスを必要とします。さらに、`WEIGHTED_SUM`は高度な戦略であり、ベクターとテキストの類似性を加重して最終的な類似性スコアを計算しますが、dot_product距離計算を専用に使用し、また全文検索インデックスを必要とします。これらの多様な戦略は、ユーザーが検索を微調整し、効率的かつ正確なデータ取得と分析を可能にします。さらに、`FILTER_BY_TEXT`、`FILTER_BY_VECTOR`、`WEIGHTED_SUM`戦略によって例示されるSingleStoreDBのハイブリッドアプローチは、ベクターとテキストベースの検索をシームレスに組み合わせて効率と精度を最大化し、ユーザーが広範なアプリケーションでプラットフォームの機能を十分に活用できるようにします。

```python
docsearch = SingleStoreDB.from_documents(
    docs,
    embeddings,
    distance_strategy=DistanceStrategy.DOT_PRODUCT,  # 類似性検索に内積を使用
    use_vector_index=True,  # ベクターインデックスを使用して高速検索
    use_full_text_search=True,  # 全文検索インデックスを使用
)

vectorResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.VECTOR_ONLY,
    filter={"category": "rain"},
)
print(vectorResults[0].page_content)

textResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.TEXT_ONLY,
)
print(textResults[0].page_content)

filteredByTextResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.FILTER_BY_TEXT,
    filter_threshold=0.1,
)
print(filteredByTextResults[0].page_content)

filteredByVectorResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.FILTER_BY_VECTOR,
    filter_threshold=0.1,
)
print(filteredByVectorResults[0].page_content)

weightedSumResults = docsearch.similarity_search(
    "rainstorm in parched desert, rain",
    k=1,
    search_strategy=SingleStoreDB.SearchStrategy.WEIGHTED_SUM,
    text_weight=0.2,
    vector_weight=0.8,
)
print(weightedSumResults[0].page_content)
```

## マルチモーダル例: CLIPおよびOpenClip埋め込みの活用

マルチモーダルデータ分析の分野では、画像やテキストなどの多様な情報タイプの統合がますます重要になっています。このような統合を促進する強力なツールの一つが[CLIP](https://openai.com/research/clip)です。これは、画像とテキストの両方を共有セマンティックスペースに埋め込むことができる最先端のモデルです。これにより、CLIPは類似性検索を通じて異なるモダリティ間で関連するコンテンツを取得することができます。

例えば、マルチモーダルデータを効果的に分析するアプリケーションシナリオを考えてみましょう。この例では、CLIPのフレームワークを活用した[OpenClipマルチモーダル埋め込み](/docs/integrations/text_embedding/open_clip)の機能を利用します。OpenClipを使用することで、テキストの説明とそれに対応する画像をシームレスに埋め込むことができ、包括的な分析と検索タスクを実行できます。テキストクエリに基づいて視覚的に類似した画像を識別する場合でも、特定の視覚コンテンツに関連するテキストパッセージを見つける場合でも、OpenClipはマルチモーダルデータから驚くべき効率と精度で洞察を引き出すことを可能にします。

```python
%pip install -U langchain openai singlestoredb langchain-experimental # (マルチモーダル用に最新バージョンが必要)
```

```python
import os

from langchain_community.vectorstores import SingleStoreDB
from langchain_experimental.open_clip import OpenCLIPEmbeddings

os.environ["SINGLESTOREDB_URL"] = "root:pass@localhost:3306/db"

TEST_IMAGES_DIR = "../../modules/images"

docsearch = SingleStoreDB(OpenCLIPEmbeddings())

image_uris = sorted(
    [
        os.path.join(TEST_IMAGES_DIR, image_name)
        for image_name in os.listdir(TEST_IMAGES_DIR)
        if image_name.endswith(".jpg")
    ]
)

# 画像の追加
docsearch.add_images(uris=image_uris)
```
