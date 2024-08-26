---
translated: true
---

# Epsilla

>[Epsilla](https://www.epsilla.com)は、ベクトルインデックス化のための高度な並列グラフトラバーサル手法を活用するオープンソースのベクトルデータベースです。Epsilla はGPL-3.0ライセンスの下で提供されています。

このノートブックでは、`Epsilla`ベクトルデータベースの機能の使用方法を示します。

前提条件として、実行中のEpsillaベクトルデータベース(たとえば、当社のDockerイメージを通じて)と`pyepsilla`パッケージをインストールする必要があります。完全なドキュメントは[docs](https://epsilla-inc.gitbook.io/epsilladb/quick-start)をご覧ください。

```python
!pip/pip3 install pyepsilla
```

OpenAIEmbeddingsを使用したいので、OpenAI APIキーを取得する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

OpenAI APIキー: ········

```python
from langchain_community.vectorstores import Epsilla
from langchain_openai import OpenAIEmbeddings
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()

documents = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0).split_documents(
    documents
)

embeddings = OpenAIEmbeddings()
```

Epsillaベクトルデータベースはデフォルトのホスト"localhost"とポート"8888"で実行されています。カスタムのdbパス、db名、コレクション名を使用しています。

```python
from pyepsilla import vectordb

client = vectordb.Client()
vector_store = Epsilla.from_documents(
    documents,
    embeddings,
    client,
    db_path="/tmp/mypath",
    db_name="MyDB",
    collection_name="MyCollection",
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query)
print(docs[0].page_content)
```

州から州へと、投票を抑制するだけでなく、選挙全体を歪めるような新しい法律が次々と制定されています。

これを許すわけにはいきません。

今夜、私は上院に以下を呼びかけます: 「投票の自由法」を可決してください。「ジョン・ルイス投票権法」を可決してください。そして、その際に「情報開示法」も可決してください。これにより、アメリカ国民は選挙資金の出所を知ることができます。

今夜、この国のために生涯を捧げてきた人物を称えたいと思います。それは、アーミー退役軍人、憲法学者、そして退任するアメリカ合衆国最高裁判所判事のスティーブン・ブレイヤー判事です。ブレイヤー判事、ご尽力ありがとうございました。

大統領が最も重要な憲法上の責任の1つは、アメリカ合衆国最高裁判所の裁判官を指名することです。

私は4日前に、連邦控訴裁判所判事のケタンジ・ブラウン・ジャクソンを指名しました。彼女は国内有数の法律家の1人であり、ブレイヤー判事の卓越した業績を継承していきます。
