---
translated: true
---

# Vectara

>[Vectara](https://vectara.com/) は、ドキュメントのインデックス作成とクエリのための使いやすいAPIを提供する信頼されたGenAIプラットフォームです。

Vectaraは、Retrieval Augmented Generationまたは[RAG](https://vectara.com/grounded-generation/)のエンドツーエンドのマネージドサービスを提供します。これには次のものが含まれます：

1. ドキュメントファイルからテキストを抽出し、それを文に分割する方法。

2. 最先端の[Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/)埋め込みモデル。各テキストチャンクはBoomerangを使用してベクトル埋め込みにエンコードされ、Vectara内部の知識（ベクトル+テキスト）ストアに保存されます。

3. クエリを自動的に埋め込みにエンコードし、最も関連性の高いテキストセグメントを取得するクエリサービス（[Hybrid Search](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching)および[MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/))のサポートを含む）

4. 引用を含む、取得したドキュメントに基づく[生成的要約](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview)を作成するオプション。

APIの使用方法の詳細については、[Vectara APIドキュメント](https://docs.vectara.com/docs/)を参照してください。

このノートブックでは、`Vectara`のLangChainとの統合に関連する機能の使用方法を示します。具体的には、[LangChainのExpression Language](/docs/expression_language/)を使用したチェーニングの使用方法と、Vectaraの統合された要約機能の使用方法を示します。

# セットアップ

VectaraをLangChainと一緒に使用するには、Vectaraアカウントが必要です。開始するには、以下の手順を使用します：

1. まだアカウントを持っていない場合は、[サインアップ](https://www.vectara.com/integrations/langchain)してVectaraアカウントを作成します。サインアップが完了すると、VectaraカスタマーIDが取得できます。カスタマーIDは、Vectaraコンソールウィンドウの右上にある名前をクリックすることで確認できます。

2. アカウント内で1つ以上のコーパスを作成できます。各コーパスは、入力ドキュメントから取り込んだテキストデータを保存する領域を表します。コーパスを作成するには、**「Create Corpus」**ボタンを使用します。その後、コーパスに名前と説明を提供します。オプションでフィルタリング属性を定義し、いくつかの高度なオプションを適用できます。作成したコーパスをクリックすると、上部にその名前とコーパスIDが表示されます。

3. 次に、コーパスにアクセスするためのAPIキーを作成する必要があります。コーパスビューの**「Authorization」**タブをクリックし、**「Create API Key」**ボタンをクリックします。キーに名前を付け、キーのクエリ専用またはクエリ+インデックスのいずれかを選択します。「Create」をクリックすると、アクティブなAPIキーが作成されます。このキーは秘密にしておいてください。

LangChainでVectaraを使用するには、次の3つの値が必要です：カスタマーID、コーパスID、およびapi_key。
これらをLangChainに提供する方法は2つあります：

1. これらの3つの変数を環境に含める：`VECTARA_CUSTOMER_ID`、`VECTARA_CORPUS_ID`、および`VECTARA_API_KEY`。

> たとえば、os.environとgetpassを使用してこれらの変数を設定することができます：

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. それらをVectara vectorstoreコンストラクタに追加します：

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

```python
from langchain_community.embeddings import FakeEmbeddings
from langchain_community.vectorstores import Vectara
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
```

最初に、state-of-the-unionテキストをVectaraにロードします。`from_files`インターフェースを使用しており、ローカル処理やチャンク化は不要です。Vectaraはファイルコンテンツを受け取り、必要な前処理、チャンク化、および埋め込みをその知識ストアに行います。

```python
vectara = Vectara.from_files(["state_of_the_union.txt"])
```

次に、Vectara retrieverを作成し、以下を指定します：
* トップ3のドキュメントマッチのみを返す
* 要約にはトップ5の結果を使用し、英語で応答する

```python
summary_config = {"is_enabled": True, "max_results": 5, "response_lang": "eng"}
retriever = vectara.as_retriever(
    search_kwargs={"k": 3, "summary_config": summary_config}
)
```

Vectaraを使用した要約では、retrieverは`Document`オブジェクトのリストを返します：
1. 最初の`k`ドキュメントは、標準のベクトルストアで慣れているように、クエリに一致するドキュメントです。
2. 要約が有効になっている場合、要約テキストを含む追加の`Document`オブジェクトが追加されます。このDocumentのメタデータフィールドは、`summary`がTrueに設定されています。

これらを分割するために、2つのユーティリティ関数を定義しましょう：

```python
def get_sources(documents):
    return documents[:-1]


def get_summary(documents):
    return documents[-1].page_content


query_str = "what did Biden say?"
```

次に、クエリの要約応答を試してみましょう：

```python
(retriever | get_summary).invoke(query_str)
```

```output
'The returned results did not contain sufficient information to be summarized into a useful answer for your query. Please try a different search or restate your query differently.'
```

そして、この要約に使用されたVectaraから取得されたソースを確認したい場合は（引用）：

```python
(retriever | get_sources).invoke(query_str)
```

```output
[Document(page_content='When they came home, many of the world’s fittest and best trained warriors were never the same. Dizziness. \n\nA cancer that would put them in a flag-draped coffin. I know. \n\nOne of those soldiers was my son Major Beau Biden. We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops. But I’m committed to finding out everything we can.', metadata={'lang': 'eng', 'section': '1', 'offset': '34652', 'len': '60', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The U.S. Department of Justice is assembling a dedicated task force to go after the crimes of Russian oligarchs. We are joining with our European allies to find and seize your yachts your luxury apartments your private jets. We are coming for your ill-begotten gains. And tonight I am announcing that we will join our allies in closing off American air space to all Russian flights – further isolating Russia – and adding an additional squeeze –on their economy. The Ruble has lost 30% of its value.', metadata={'lang': 'eng', 'section': '1', 'offset': '3807', 'len': '42', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='He rejected repeated efforts at diplomacy. He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. We were ready.  Here is what we did. We prepared extensively and carefully.', metadata={'lang': 'eng', 'section': '1', 'offset': '2100', 'len': '42', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'})]
```

Vectaraの「RAG as a service」は、質問応答やチャットボットチェーンの作成において多くの重労働を引き受けます。LangChainとの統合により、`SelfQueryRetriever`や`MultiQueryRetriever`などのクエリ前処理機能を使用するオプションが提供されます。[MultiQueryRetriever](/docs/modules/data_connection/retrievers/MultiQueryRetriever)の使用例を見てみましょう。

MQRはLLMを使用するため、それを設定する必要があります - ここでは`ChatOpenAI`を選択します：

```python
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)
mqr = MultiQueryRetriever.from_llm(retriever=retriever, llm=llm)

(mqr | get_summary).invoke(query_str)
```

```output
"President Biden has made several notable quotes and comments. He expressed a commitment to investigate the potential impact of burn pits on soldiers' health, referencing his son's brain cancer [1]. He emphasized the importance of unity among Americans, urging us to see each other as fellow citizens rather than enemies [2]. Biden also highlighted the need for schools to use funds from the American Rescue Plan to hire teachers and address learning loss, while encouraging community involvement in supporting education [3]."
```

```python
(mqr | get_sources).invoke(query_str)
```

```output
[Document(page_content='When they came home, many of the world’s fittest and best trained warriors were never the same. Dizziness. \n\nA cancer that would put them in a flag-draped coffin. I know. \n\nOne of those soldiers was my son Major Beau Biden. We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops. But I’m committed to finding out everything we can.', metadata={'lang': 'eng', 'section': '1', 'offset': '34652', 'len': '60', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The U.S. Department of Justice is assembling a dedicated task force to go after the crimes of Russian oligarchs. We are joining with our European allies to find and seize your yachts your luxury apartments your private jets. We are coming for your ill-begotten gains. And tonight I am announcing that we will join our allies in closing off American air space to all Russian flights – further isolating Russia – and adding an additional squeeze –on their economy. The Ruble has lost 30% of its value.', metadata={'lang': 'eng', 'section': '1', 'offset': '3807', 'len': '42', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='And, if Congress provides the funds we need, we’ll have new stockpiles of tests, masks, and pills ready if needed. I cannot promise a new variant won’t come. But I can promise you we’ll do everything within our power to be ready if it does. Third – we can end the shutdown of schools and businesses. We have the tools we need.', metadata={'lang': 'eng', 'section': '1', 'offset': '24753', 'len': '82', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The returned results did not contain sufficient information to be summarized into a useful answer for your query. Please try a different search or restate your query differently.', metadata={'summary': True}),
 Document(page_content='Danielle says Heath was a fighter to the very end. He didn’t know how to stop fighting, and neither did she. Through her pain she found purpose to demand we do better. Tonight, Danielle—we are. The VA is pioneering new ways of linking toxic exposures to diseases, already helping more veterans get benefits.', metadata={'lang': 'eng', 'section': '1', 'offset': '35502', 'len': '58', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='Let’s stop seeing each other as enemies, and start seeing each other for who we really are: Fellow Americans. We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together. I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera. They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.', metadata={'lang': 'eng', 'section': '1', 'offset': '26312', 'len': '89', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The American Rescue Plan gave schools money to hire teachers and help students make up for lost learning. I urge every parent to make sure your school does just that. And we can all play a part—sign up to be a tutor or a mentor. Children were also struggling before the pandemic. Bullying, violence, trauma, and the harms of social media.', metadata={'lang': 'eng', 'section': '1', 'offset': '33227', 'len': '61', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'})]
```
