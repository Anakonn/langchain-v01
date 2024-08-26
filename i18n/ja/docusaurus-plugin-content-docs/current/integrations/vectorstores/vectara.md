---
translated: true
---

# Vectara

>[Vectara](https://vectara.com/) は、ドキュメントのインデックス作成とクエリのための使いやすいAPIを提供する信頼できるGenAIプラットフォームです。

Vectaraは、検索強化生成（Retrieval Augmented Generation、または[RAG](https://vectara.com/grounded-generation/)）のためのエンドツーエンドの管理サービスを提供します。これには以下が含まれます：

1. ドキュメントファイルからテキストを抽出し、文ごとに分割する方法。

2. 最先端の[Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/)埋め込みモデル。各テキストチャンクはBoomerangを使用してベクトル埋め込みにエンコードされ、Vectaraの内部知識（ベクトル＋テキスト）ストアに保存されます。

3. クエリを自動的にエンコードして埋め込みに変換し、最も関連性の高いテキストセグメントを取得するクエリサービス（[ハイブリッド検索](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching)と[MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/))をサポート）

4. 引用を含む取得されたドキュメントに基づいて[生成的な要約](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview)を作成するオプション。

APIの使用方法に関する詳細は、[Vectara APIドキュメント](https://docs.vectara.com/docs/)を参照してください。

このノートブックでは、Vectaraを単なるベクトルストア（要約なし）として利用する際の基本的な検索機能の使用方法を示します。`similarity_search`と`similarity_search_with_score`、およびLangChainの`as_retriever`機能を使用します。

# セットアップ

VectaraをLangChainと一緒に使用するには、Vectaraアカウントが必要です。以下の手順で開始してください：

1. Vectaraアカウントをまだ持っていない場合は、[サインアップ](https://www.vectara.com/integrations/langchain)してください。サインアップが完了すると、VectaraのカスタマーIDが発行されます。カスタマーIDは、Vectaraコンソールウィンドウの右上の名前をクリックすると確認できます。

2. アカウント内で1つ以上のコーパスを作成できます。各コーパスは、入力ドキュメントから取り込まれたテキストデータを保存するエリアを表します。コーパスを作成するには、**「コーパスを作成」**ボタンを使用します。コーパスに名前と説明を提供します。オプションでフィルタリング属性を定義し、いくつかの高度なオプションを適用できます。作成したコーパスをクリックすると、その名前とコーパスIDが上部に表示されます。

3. 次に、コーパスにアクセスするためのAPIキーを作成する必要があります。コーパスビューの**「認証」**タブをクリックし、**「APIキーを作成」**ボタンをクリックします。キーに名前を付け、キーのクエリのみまたはクエリ＋インデックスを選択します。「作成」をクリックすると、アクティブなAPIキーが作成されます。このキーを秘密にしておいてください。

LangChainとVectaraを使用するには、以下の3つの値が必要です：カスタマーID、コーパスID、そしてapi_key。
これらをLangChainに提供する方法は2つあります：

1. 環境変数にこれらの3つの変数を含めます：`VECTARA_CUSTOMER_ID`、`VECTARA_CORPUS_ID`、および`VECTARA_API_KEY`。

> 例えば、os.environとgetpassを使用してこれらの変数を設定することができます：

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. Vectaraベクトルストアコンストラクタに追加します：

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

## LangChainからVectaraに接続する

まず、from_documents()メソッドを使用してドキュメントを取り込みます。
ここではVECTARA_CUSTOMER_ID、VECTARA_CORPUS_ID、およびクエリ＋インデックスVECTARA_API_KEYが環境変数として追加されていると仮定します。

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import Vectara
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
vectara = Vectara.from_documents(
    docs,
    embedding=FakeEmbeddings(size=768),
    doc_metadata={"speech": "state-of-the-union"},
)
```

Vectaraのインデックス作成APIは、ファイルが直接Vectaraによって処理され、前処理され、最適にチャンク化され、Vectaraベクトルストアに追加されるファイルアップロードAPIを提供します。
これを使用するために、add_files()メソッド（およびfrom_files()）を追加しました。

実際にこれを見てみましょう。アップロードするPDFドキュメントを2つ選びます：

1. キング牧師による「I have a dream」スピーチ
2. チャーチルの「We Shall Fight on the Beaches」スピーチ

```python
import tempfile
import urllib.request

urls = [
    [
        "https://www.gilderlehrman.org/sites/default/files/inline-pdfs/king.dreamspeech.excerpts.pdf",
        "I-have-a-dream",
    ],
    [
        "https://www.parkwayschools.net/cms/lib/MO01931486/Centricity/Domain/1578/Churchill_Beaches_Speech.pdf",
        "we shall fight on the beaches",
    ],
]
files_list = []
for url, _ in urls:
    name = tempfile.NamedTemporaryFile().name
    urllib.request.urlretrieve(url, name)
    files_list.append(name)

docsearch: Vectara = Vectara.from_files(
    files=files_list,
    embedding=FakeEmbeddings(size=768),
    metadatas=[{"url": url, "speech": title} for url, title in urls],
)
```

## 類似検索

Vectaraを使用する最もシンプルなシナリオは、類似検索を実行することです。

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vectara.similarity_search(
    query, n_sentence_context=0, filter="doc.speech = 'state-of-the-union'"
)
```

```python
found_docs
```

```output
[Document(page_content='And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '596', 'len': '97', 'speech': 'state-of-the-union'}),
 Document(page_content='In this struggle as President Zelenskyy said in his speech to the European Parliament “Light will win over darkness.”', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '141', 'len': '117', 'speech': 'state-of-the-union'}),
 Document(page_content='As Ohio Senator Sherrod Brown says, “It’s time to bury the label “Rust Belt.”', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '0', 'len': '77', 'speech': 'state-of-the-union'}),
 Document(page_content='Last month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '0', 'len': '122', 'speech': 'state-of-the-union'}),
 Document(page_content='He thought he could roll into Ukraine and the world would roll over.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '664', 'len': '68', 'speech': 'state-of-the-union'}),
 Document(page_content='That’s why one of the first things I did as President was fight to pass the American Rescue Plan.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '314', 'len': '97', 'speech': 'state-of-the-union'}),
 Document(page_content='And he thought he could divide us at home.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '160', 'len': '42', 'speech': 'state-of-the-union'}),
 Document(page_content='He met the Ukrainian people.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '788', 'len': '28', 'speech': 'state-of-the-union'}),
 Document(page_content='He thought the West and NATO wouldn’t respond.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '113', 'len': '46', 'speech': 'state-of-the-union'}),
 Document(page_content='In this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '772', 'len': '131', 'speech': 'state-of-the-union'})]
```

```python
print(found_docs[0].page_content)
```

```output
And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson.
```

## スコア付き類似検索

時には検索を実行するだけでなく、特定の結果がどれほど良いかを知るために関連性スコアも取得したいことがあります。

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vectara.similarity_search_with_score(
    query,
    filter="doc.speech = 'state-of-the-union'",
    score_threshold=0.2,
)
```

```python
document, score = found_docs[0]
print(document.page_content)
print(f"\nScore: {score}")
```

```output
Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.

Score: 0.74179757
```

次に、アップロードしたファイルのコンテンツに対して同様の検索を行います

```python
query = "We must forever conduct our struggle"
min_score = 1.2
found_docs = vectara.similarity_search_with_score(
    query,
    filter="doc.speech = 'I-have-a-dream'",
    score_threshold=min_score,
)
print(f"With this threshold of {min_score} we have {len(found_docs)} documents")
```

```output
With this threshold of 1.2 we have 0 documents
```

```python
query = "We must forever conduct our struggle"
min_score = 0.2
found_docs = vectara.similarity_search_with_score(
    query,
    filter="doc.speech = 'I-have-a-dream'",
    score_threshold=min_score,
)
print(f"With this threshold of {min_score} we have {len(found_docs)} documents")
```

```output
With this threshold of 0.2 we have 10 documents
```

MMRは、多くのアプリケーションにおいて重要な検索能力であり、GenAIアプリケーションにフィードされる検索結果が再ランク付けされ、結果の多様性が向上します。

Vectaraでの動作を見てみましょう：

```python
query = "state of the economy"
found_docs = vectara.similarity_search(
    query,
    n_sentence_context=0,
    filter="doc.speech = 'state-of-the-union'",
    k=5,
    mmr_config={"is_enabled": True, "mmr_k": 50, "diversity_bias": 0.0},
)
print("\n\n".join([x.page_content for x in found_docs]))
```

```output
Economic assistance.

Grow the workforce. Build the economy from the bottom up
and the middle out, not from the top down.

When we invest in our workers, when we build the economy from the bottom up and the middle out together, we can do something we haven’t done in a long time: build a better America.

Our economy grew at a rate of 5.7% last year, the strongest growth in nearly 40 years, the first step in bringing fundamental change to an economy that hasn’t worked for the working people of this nation for too long.

Economists call it “increasing the productive capacity of our economy.”
```

```python
query = "state of the economy"
found_docs = vectara.similarity_search(
    query,
    n_sentence_context=0,
    filter="doc.speech = 'state-of-the-union'",
    k=5,
    mmr_config={"is_enabled": True, "mmr_k": 50, "diversity_bias": 1.0},
)
print("\n\n".join([x.page_content for x in found_docs]))
```

```output
Economic assistance.

The Russian stock market has lost 40% of its value and trading remains suspended.

But that trickle-down theory led to weaker economic growth, lower wages, bigger deficits, and the widest gap between those at the top and everyone else in nearly a century.

In state after state, new laws have been passed, not only to suppress the vote, but to subvert entire elections.

The federal government spends about $600 Billion a year to keep the country safe and secure.
```

ご覧のように、最初の例ではdiversity_biasが0.0（多様性再ランク付けが無効）に設定されており、最も関連性の高いトップ5のドキュメントが得られました。diversity_bias=1.0の場合、多様性が最大化され、結果として得られるトップドキュメントはその意味的な意味においてはるかに多様であることがわかります。

## RetrieverとしてのVectara

最後に、`as_retriever()`インターフェースを使用してVectaraを使用する方法を見てみましょう：

```python
retriever = vectara.as_retriever()
retriever
```

```output
VectorStoreRetriever(tags=['Vectara'], vectorstore=<langchain_community.vectorstores.vectara.Vectara object at 0x109a3c760>)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
retriever.invoke(query)[0]
```

```output
Document(page_content='Justice Breyer, thank you for your service. One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence. A former top litigator in private practice.', metadata={'source': 'langchain', 'lang': 'eng', 'offset': '596', 'len': '97', 'speech': 'state-of-the-union'})
```
