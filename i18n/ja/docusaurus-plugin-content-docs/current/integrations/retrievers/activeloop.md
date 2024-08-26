---
translated: true
---

# Activeloop Deep Memory

>[Activeloop Deep Memory](https://docs.activeloop.ai/performance-features/deep-memory)は、ベクトルストアを用途に合わせて最適化し、LLMアプリの精度を向上させるためのツールスイートです。

`Retrieval-Augmented Generatation`(`RAG`)は最近大きな注目を集めています。高度なRAG手法とエージェントが登場するにつれ、RAGが達成できる可能性が広がっています。しかし、RAGを本番環境に統合する際には、いくつかの課題があります。本番環境でRAGを実装する際の主な考慮事項は、精度(recall)、コスト、レイテンシーです。基本的な用途の場合、OpenAIのAdaモデルと単純な類似検索を組み合わせれば、満足のいく結果が得られます。しかし、検索時の精度や recall を高めるには、高度な検索手法を使う必要があります。これらの手法には、データチャンクサイズの変更、クエリの複数回書き換えなどが含まれ、レイテンシーとコストが増加する可能性があります。Activeloopの[Deep Memory](https://www.activeloop.ai/resources/use-deep-memory-to-boost-rag-apps-accuracy-by-up-to-22/)は、`Activeloop Deep Lake`ユーザー向けの機能で、ユーザークエリとコーパスのデータを効果的に照合するための小さなニューラルネットワークレイヤーを導入することで、これらの課題に対処しています。この追加は検索時のレイテンシーをほとんど増加させませんが、検索精度を最大27%向上させ、さらに追加の高度なrag手法を必要とせずにコスト効率的で使いやすいものになっています。

このチュチュリアルでは、`DeepLake`のドキュメントを解析し、ドキュメントからの質問に答えられるRAGシステムを作成します。

## 1. データセットの作成

このチュートリアルでは、`BeautifulSoup`ライブラリとLangChainのドキュメントパーサーである`Html2TextTransformer`、`AsyncHtmlLoader`を使ってActiveloopのドキュメントを解析します。そのため、以下のライブラリをインストールする必要があります:

```python
%pip install --upgrade --quiet  tiktoken langchain-openai python-dotenv datasets langchain deeplake beautifulsoup4 html2text ragas
```

また、[Activeloop](https://activeloop.ai)アカウントを作成する必要があります。

```python
ORG_ID = "..."
```

```python
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import DeepLake
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter your OpenAI API token: ")
# # activeloop token is needed if you are not signed in using CLI: `activeloop login -u <USERNAME> -p <PASSWORD>`
os.environ["ACTIVELOOP_TOKEN"] = getpass.getpass(
    "Enter your ActiveLoop API token: "
)  # Get your API token from https://app.activeloop.ai, click on your profile picture in the top right corner, and select "API Tokens"

token = os.getenv("ACTIVELOOP_TOKEN")
openai_embeddings = OpenAIEmbeddings()
```

```python
db = DeepLake(
    dataset_path=f"hub://{ORG_ID}/deeplake-docs-deepmemory",  # org_id stands for your username or organization from activeloop
    embedding=openai_embeddings,
    runtime={"tensor_db": True},
    token=token,
    # overwrite=True, # user overwrite flag if you want to overwrite the full dataset
    read_only=False,
)
```

`BeautifulSoup`を使ってウェブページ内のすべてのリンクをパースします。

```python
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


def get_all_links(url):
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to retrieve the page: {url}")
        return []

    soup = BeautifulSoup(response.content, "html.parser")

    # Finding all 'a' tags which typically contain href attribute for links
    links = [
        urljoin(url, a["href"]) for a in soup.find_all("a", href=True) if a["href"]
    ]

    return links


base_url = "https://docs.deeplake.ai/en/latest/"
all_links = get_all_links(base_url)
```

データのロード:

```python
from langchain_community.document_loaders.async_html import AsyncHtmlLoader

loader = AsyncHtmlLoader(all_links)
docs = loader.load()
```

データを読みやすい形式に変換:

```python
from langchain_community.document_transformers import Html2TextTransformer

html2text = Html2TextTransformer()
docs_transformed = html2text.transform_documents(docs)
```

次に、一部のドキュメントが長すぎるため、さらにドキュメントをチャンク化します:

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

chunk_size = 4096
docs_new = []

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size,
)

for doc in docs_transformed:
    if len(doc.page_content) < chunk_size:
        docs_new.append(doc)
    else:
        docs = text_splitter.create_documents([doc.page_content])
        docs_new.extend(docs)
```

VectorStoreへのデータ登録:

```python
docs = db.add_documents(docs_new)
```

## 2. 合成クエリの生成とDeep Memoryのトレーニング

次のステップは、既存のデータセットとユーザークエリを適切に照合するdeep_memoryモデルをトレーニングすることです。ユーザークエリがまだない場合は心配しないでください。LLMを使って生成します!

#### TODO: Add image

上の図は、deep_memoryの全体的なスキームを示しています。トレーニングには、relevance、queriesとコーパスデータ(クエリ対象のデータ)が必要です。コーパスデータは前のセクションですでに登録済みです。ここでは質問とrelevanceを生成します。

1. `questions` - 各文字列がクエリを表す文字列のリスト
2. `relevance` - 各質問に対する正解ドキュメントへのリンクが含まれています。1つの質問に対して複数のドキュメントが関連する可能性があるため、relevanceは`List[List[tuple[str, float]]]`の形式をとります。外側のリストは質問を、内側のリストは関連ドキュメントを表します。タプルの最初の要素はドキュメントのID(データセットの`id`テンソルに対応)、2番目の要素はその文書が質問に関連する度合いを表す浮動小数点数です。

それでは、合成の質問とrelevanceを生成しましょう:

```python
from typing import List

from langchain.chains.openai_functions import (
    create_structured_output_chain,
)
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
```

```python
# fetch dataset docs and ids if they exist (optional you can also ingest)
docs = db.vectorstore.dataset.text.data(fetch_chunks=True, aslist=True)["value"]
ids = db.vectorstore.dataset.id.data(fetch_chunks=True, aslist=True)["value"]
```

```python
# If we pass in a model explicitly, we need to make sure it supports the OpenAI function-calling API.
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)


class Questions(BaseModel):
    """Identifying information about a person."""

    question: str = Field(..., description="Questions about text")


prompt_msgs = [
    SystemMessage(
        content="You are a world class expert for generating questions based on provided context. \
                You make sure the question can be answered by the text."
    ),
    HumanMessagePromptTemplate.from_template(
        "Use the given text to generate a question from the following input: {input}"
    ),
    HumanMessage(content="Tips: Make sure to answer in the correct format"),
]
prompt = ChatPromptTemplate(messages=prompt_msgs)
chain = create_structured_output_chain(Questions, llm, prompt, verbose=True)

text = "# Understanding Hallucinations and Bias ## **Introduction** In this lesson, we'll cover the concept of **hallucinations** in LLMs, highlighting their influence on AI applications and demonstrating how to mitigate them using techniques like the retriever's architectures. We'll also explore **bias** within LLMs with examples."
questions = chain.run(input=text)
print(questions)
```

```python
import random

from langchain_openai import OpenAIEmbeddings
from tqdm import tqdm


def generate_queries(docs: List[str], ids: List[str], n: int = 100):
    questions = []
    relevances = []
    pbar = tqdm(total=n)
    while len(questions) < n:
        # 1. randomly draw a piece of text and relevance id
        r = random.randint(0, len(docs) - 1)
        text, label = docs[r], ids[r]

        # 2. generate queries and assign and relevance id
        generated_qs = [chain.run(input=text).question]
        questions.extend(generated_qs)
        relevances.extend([[(label, 1)] for _ in generated_qs])
        pbar.update(len(generated_qs))
        if len(questions) % 10 == 0:
            print(f"q: {len(questions)}")
    return questions[:n], relevances[:n]


chain = create_structured_output_chain(Questions, llm, prompt, verbose=False)
questions, relevances = generate_queries(docs, ids, n=200)

train_questions, train_relevances = questions[:100], relevances[:100]
test_questions, test_relevances = questions[100:], relevances[100:]
```

ここで100件の学習用クエリと100件のテスト用クエリを作成しました。それではdeep_memoryをトレーニングしましょう:

```python
job_id = db.vectorstore.deep_memory.train(
    queries=train_questions,
    relevance=train_relevances,
)
```

トレーニングの進捗を確認しましょう:

```python
db.vectorstore.deep_memory.status("6538939ca0b69a9ca45c528c")
```

```output

--------------------------------------------------------------
|                  6538e02ecda4691033a51c5b                  |
--------------------------------------------------------------
| status                     | completed                     |
--------------------------------------------------------------
| progress                   | eta: 1.4 seconds              |
|                            | recall@10: 79.00% (+34.00%)   |
--------------------------------------------------------------
| results                    | recall@10: 79.00% (+34.00%)   |
--------------------------------------------------------------
```

## 3. Deep Memoryの性能評価

素晴らしい、モデルがトレーニングできました!recallの大幅な改善が見られますが、新しいデータにどのように使えるか、評価してみましょう。このセクションではモデルの評価と推論について詳しく見ていきます。

### 3.1 Deep Memoryの評価

まずはdeep_memoryの組み込み評価メソッドを使ってみましょう。
いくつかの`recall`メトリックスを計算できます。
わずか数行のコードで簡単に行えます。

```python
recall = db.vectorstore.deep_memory.evaluate(
    queries=test_questions,
    relevance=test_relevances,
)
```

```output

Embedding queries took 0.81 seconds
---- Evaluating without model ----
Recall@1:	  9.0%
Recall@3:	  19.0%
Recall@5:	  24.0%
Recall@10:	  42.0%
Recall@50:	  93.0%
Recall@100:	  98.0%
---- Evaluating with model ----
Recall@1:	  19.0%
Recall@3:	  42.0%
Recall@5:	  49.0%
Recall@10:	  69.0%
Recall@50:	  97.0%
Recall@100:	  97.0%
```

テストデータセットでも大幅な改善が見られます!!!

### 3.2 Deep Memory + RAG

```python
from ragas.langchain import RagasEvaluatorChain
from ragas.metrics import (
    context_recall,
)
```

recallを正解データに変換しましょう:

```python
def convert_relevance_to_ground_truth(docs, relevance):
    ground_truths = []

    for rel in relevance:
        ground_truth = []
        for doc_id, _ in rel:
            ground_truth.append(docs[doc_id])
        ground_truths.append(ground_truth)
    return ground_truths
```

```python
ground_truths = convert_relevance_to_ground_truth(docs, test_relevances)

for deep_memory in [False, True]:
    print("\nEvaluating with deep_memory =", deep_memory)
    print("===================================")

    retriever = db.as_retriever()
    retriever.search_kwargs["deep_memory"] = deep_memory

    qa_chain = RetrievalQA.from_chain_type(
        llm=ChatOpenAI(model="gpt-3.5-turbo"),
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
    )

    metrics = {
        "context_recall_score": 0,
    }

    eval_chains = {m.name: RagasEvaluatorChain(metric=m) for m in [context_recall]}

    for question, ground_truth in zip(test_questions, ground_truths):
        result = qa_chain({"query": question})
        result["ground_truths"] = ground_truth
        for name, eval_chain in eval_chains.items():
            score_name = f"{name}_score"
            metrics[score_name] += eval_chain(result)[score_name]

    for metric in metrics:
        metrics[metric] /= len(test_questions)
        print(f"{metric}: {metrics[metric]}")
    print("===================================")
```

```output

Evaluating with deep_memory = False
===================================
context_recall_score = 0.3763423145
===================================

Evaluating with deep_memory = True
===================================
context_recall_score = 0.5634545323
===================================
```

### 3.3 Deep Memoryの推論

#### TODO: Add image

deep_memoryを使った場合

```python
retriever = db.as_retriever()
retriever.search_kwargs["deep_memory"] = True
retriever.search_kwargs["k"] = 10

query = "Deamination of cytidine to uridine on the minus strand of viral DNA results in catastrophic G-to-A mutations in the viral genome."
qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"), chain_type="stuff", retriever=retriever
)
print(qa.run(query))
```

```output
The base htype of the 'video_seq' tensor is 'video'.
```

deep_memoryを使わない場合

```python
retriever = db.as_retriever()
retriever.search_kwargs["deep_memory"] = False
retriever.search_kwargs["k"] = 10

query = "Deamination of cytidine to uridine on the minus strand of viral DNA results in catastrophic G-to-A mutations in the viral genome."
qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"), chain_type="stuff", retriever=retriever
)
qa.run(query)
```

```output
The text does not provide information on the base htype of the 'video_seq' tensor.
```

### 3.4 Deep Memoryのコスト削減

Deep Memoryは既存のワークフローを変更することなく、検索精度を向上させることができます。さらに、LLMへの`top_k`入力を減らすことで、トークン使用量の削減によるコスト削減も実現できます。
