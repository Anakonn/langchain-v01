---
translated: true
---

<a target="_blank" href="https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/integrations/callbacks/uptrain.ipynb">
  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/>
</a>

# UpTrain

> UpTrain [[github](https://github.com/uptrain-ai/uptrain) || [website](https://uptrain.ai/) || [docs](https://docs.uptrain.ai/getting-started/introduction)] は、LLMアプリケーションを評価し改善するためのオープンソースプラットフォームです。言語、コード、埋め込み使用例など20以上の事前設定されたチェックのグレードを提供し、障害事例の根本原因分析を行い、それらの解決方法のガイダンスを提供します。

## UpTrainコールバックハンドラ

このノートブックでは、UpTrainコールバックハンドラを滑らかにパイプラインに統合し、さまざまな評価を行うことを紹介しています。私たちは、チェーンを評価するのに適切だと考えられる評価をいくつか選択しました。これらの評価は自動的に実行され、結果が出力に表示されます。UpTrainの評価の詳細については[こちら](https://github.com/uptrain-ai/uptrain?tab=readme-ov-file#pre-built-evaluations-we-offer-)をご覧ください。

デモンストレーションのために、Langchainから選択されたリトリーバーを強調しています:

### 1. **Vanilla RAG**:

RAGは、コンテキストの取得と応答の生成に重要な役割を果たします。その性能と応答品質を確保するために、次の評価を行います:

- **[コンテキストの関連性](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-relevance)**: クエリから抽出されたコンテキストが応答に関連しているかどうかを判断します。
- **[事実的正確性](https://docs.uptrain.ai/predefined-evaluations/context-awareness/factual-accuracy)**: LLMが幻想を抱いたり、間違った情報を提供していないかを評価します。
- **[応答の完全性](https://docs.uptrain.ai/predefined-evaluations/response-quality/response-completeness)**: クエリによって要求された情報がすべて含まれているかどうかをチェックします。

### 2. **マルチクエリ生成**:

MultiQueryRetrieverは、元のクエリと意味が似た複数のクエリバリエーションを作成します。複雑さを考慮して、前述の評価に加えて以下を行います:

- **[マルチクエリ精度](https://docs.uptrain.ai/predefined-evaluations/query-quality/multi-query-accuracy)**: 生成されたマルチクエリが元のクエリと同じ意味を持つことを保証します。

### 3. **コンテキストの圧縮とリランキング**:

リランキングは、クエリに対する関連性に基づいてノードを並べ替え、上位nノードを選択するプロセスです。リランキング完了後にノード数が減少する可能性があるため、次の評価を行います:

- **[コンテキストのリランキング](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-reranking)**: 再ランク化されたノードの順序が、元の順序よりもクエリに関連性が高いかどうかをチェックします。
- **[コンテキストの簡潔さ](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-conciseness)**: ノード数が減少しても、必要な情報がすべて提供されているかどうかを調べます。

これらの評価は、チェーン内のRAG、MultiQueryRetriever、およびリランキングプロセスの堅牢性と有効性を総合的に保証します。

## 依存関係のインストール

```python
%pip install -qU langchain langchain_openai uptrain faiss-cpu flashrank
```

```output
huggingface/tokenizers: The current process just got forked, after parallelism has already been used. Disabling parallelism to avoid deadlocks...
To disable this warning, you can either:
	- Avoid using `tokenizers` before the fork if possible
	- Explicitly set the environment variable TOKENIZERS_PARALLELISM=(true | false)

[33mWARNING: There was an error checking the latest version of pip.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

注意: `faiss-cpu`の代わりに`faiss-gpu`をインストールすることで、GPUサポート版のライブラリを使用できます。

## ライブラリのインポート

```python
from getpass import getpass

from langchain.chains import RetrievalQA
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import FlashrankRerank
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_community.callbacks.uptrain_callback import UpTrainCallbackHandler
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers.string import StrOutputParser
from langchain_core.prompts.chat import ChatPromptTemplate
from langchain_core.runnables.passthrough import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)
```

## ドキュメントの読み込み

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
```

## ドキュメントをチャンクに分割

```python
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
chunks = text_splitter.split_documents(documents)
```

## リトリーバーの作成

```python
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(chunks, embeddings)
retriever = db.as_retriever()
```

## LLMの定義

```python
llm = ChatOpenAI(temperature=0, model="gpt-4")
```

## OpenAI APIキーの設定

この鍵は評価を行うために必要です。UpTrainはGPTモデルを使用してLLMによって生成された応答を評価します。

```python
OPENAI_API_KEY = getpass()
```

## セットアップ

以下のリトリーバーごとに、干渉を避けるためにコールバックハンドラを再定義するのが良いでしょう。UpTrainを使用して評価するには、次のオプションから選択できます:

### 1. **UpTrainのオープンソースソフトウェア(OSS)**:

オープンソースの評価サービスを使用してモデルを評価できます。
この場合、OpenAI APIキーを提供する必要があります。キーは[こちら](https://platform.openai.com/account/api-keys)から取得できます。

パラメータ:
- key_type="openai"
- api_key="OPENAI_API_KEY"
- project_name_prefix="PROJECT_NAME_PREFIX"

### 2. **UpTrainマネージドサービスとダッシュボード**:

[こちら](https://uptrain.ai/)からUpTrainの無料アカウントを作成し、無料トライアルクレジットを取得できます。さらにトライアルクレジットが必要な場合は、[UpTrainのメンテナンサーにお問い合わせください](https://calendly.com/uptrain-sourabh/30min)。

UpTrainマネージドサービスでは以下のことができます:
1. 高度なドリルダウンとフィルタリングオプションを備えたダッシュボード
1. 失敗事例の一般的なトピックに関する洞察
1. 本番環境データの可観測性とリアルタイムモニタリング
1. CI/CDパイプラインとの滑らかな統合によるリグレッション テスト

このノートブックには、UpTrainマネージドサービスのダッシュボードと洞察の一部のスクリーンショットが含まれています。

パラメータ:
- key_type="uptrain"
- api_key="UPTRAIN_API_KEY"
- project_name_prefix="PROJECT_NAME_PREFIX"

**注意:** `project_name_prefix`は、UpTrainダッシュボードのプロジェクト名のプレフィックスとして使用されます。評価の種類によって異なります。例えば、project_name_prefix="langchain"と設定し、multi_query評価を実行した場合、プロジェクト名は"langchain_multi_query"になります。

# 1. 素朴なRAG

UpTrainコールバックハンドラは、生成されたクエリ、コンテキスト、レスポンスを自動的にキャプチャし、レスポンスに対して以下の3つの評価 *(0から1までの評価)* を実行します:
- **[コンテキストの関連性](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-relevance)**: クエリから抽出されたコンテキストがレスポンスに関連しているかどうかを確認します。
- **[事実の正確性](https://docs.uptrain.ai/predefined-evaluations/context-awareness/factual-accuracy)**: レスポンスの事実的な正確性を確認します。
- **[レスポンスの完全性](https://docs.uptrain.ai/predefined-evaluations/response-quality/response-completeness)**: レスポンスがクエリが求めている情報をすべて含んでいるかどうかを確認します。

```python
# Create the RAG prompt
template = """Answer the question based only on the following context, which can include text and tables:
{context}
Question: {question}
"""
rag_prompt_text = ChatPromptTemplate.from_template(template)

# Create the chain
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | rag_prompt_text
    | llm
    | StrOutputParser()
)

# Create the uptrain callback handler
uptrain_callback = UpTrainCallbackHandler(key_type="openai", api_key=OPENAI_API_KEY)
config = {"callbacks": [uptrain_callback]}

# Invoke the chain with a query
query = "What did the president say about Ketanji Brown Jackson"
docs = chain.invoke(query, config=config)
```

```output
[32m2024-04-17 17:03:44.969[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:05.809[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Response: The president mentioned that he had nominated Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence. He also mentioned that she is a former top litigator in private practice, a former federal public defender, and comes from a family of public school educators and police officers. He described her as a consensus builder and noted that since her nomination, she has received a broad range of support from various groups, including the Fraternal Order of Police and former judges appointed by both Democrats and Republicans.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 1.0
```

# 2. マルチクエリ生成

**MultiQueryRetriever**は、RAGパイプラインがクエリに基づいて最適なドキュメントセットを返さない可能性がある問題に取り組むために使用されます。オリジナルのクエリと同じ意味を持つ複数のクエリを生成し、それぞれのクエリに対してドキュメントを取得します。

このリトリーバーを評価するために、UpTrainは以下の評価を実行します:
- **[マルチクエリの正確性](https://docs.uptrain.ai/predefined-evaluations/query-quality/multi-query-accuracy)**: 生成されたマルチクエリがオリジナルのクエリと同じ意味を持っているかどうかを確認します。

```python
# Create the retriever
multi_query_retriever = MultiQueryRetriever.from_llm(retriever=retriever, llm=llm)

# Create the uptrain callback
uptrain_callback = UpTrainCallbackHandler(key_type="openai", api_key=OPENAI_API_KEY)
config = {"callbacks": [uptrain_callback]}

# Create the RAG prompt
template = """Answer the question based only on the following context, which can include text and tables:
{context}
Question: {question}
"""
rag_prompt_text = ChatPromptTemplate.from_template(template)

chain = (
    {"context": multi_query_retriever, "question": RunnablePassthrough()}
    | rag_prompt_text
    | llm
    | StrOutputParser()
)

# Invoke the chain with a query
question = "What did the president say about Ketanji Brown Jackson"
docs = chain.invoke(question, config=config)
```

```output
[32m2024-04-17 17:04:10.675[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:16.804[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Multi Queries:
  - How did the president comment on Ketanji Brown Jackson?
  - What were the president's remarks regarding Ketanji Brown Jackson?
  - What statements has the president made about Ketanji Brown Jackson?

Multi Query Accuracy Score: 0.5

[32m2024-04-17 17:04:22.027[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:44.033[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Response: The president mentioned that he had nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence. He also mentioned that since her nomination, she has received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 1.0
```

# 3. コンテキストの圧縮とリランキング

リランキングプロセスは、クエリに対する関連性に基づいてノードを並び替え、上位nつのノードを選択することを含みます。リランキング完了後にノードの数が減少する可能性があるため、以下の評価を実行します:
- **[コンテキストのリランキング](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-reranking)**: オリジナルの順序よりもクエリに関連性の高い順序にノードが並び替えられているかどうかを確認します。
- **[コンテキストの簡潔さ](https://docs.uptrain.ai/predefined-evaluations/context-awareness/context-conciseness)**: ノードの数が減少しても、必要な情報がすべて提供されているかどうかを確認します。

```python
# Create the retriever
compressor = FlashrankRerank()
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor, base_retriever=retriever
)

# Create the chain
chain = RetrievalQA.from_chain_type(llm=llm, retriever=compression_retriever)

# Create the uptrain callback
uptrain_callback = UpTrainCallbackHandler(key_type="openai", api_key=OPENAI_API_KEY)
config = {"callbacks": [uptrain_callback]}

# Invoke the chain with a query
query = "What did the president say about Ketanji Brown Jackson"
result = chain.invoke(query, config=config)
```

```output
[32m2024-04-17 17:04:46.462[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:04:53.561[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson

Context Conciseness Score: 0.0
Context Reranking Score: 1.0

[32m2024-04-17 17:04:56.947[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate_on_server[0m:[36m378[0m - [1mSending evaluation request for rows 0 to <50 to the Uptrain[0m
[32m2024-04-17 17:05:16.551[0m | [1mINFO    [0m | [36muptrain.framework.evalllm[0m:[36mevaluate[0m:[36m367[0m - [1mLocal server not running, start the server to log data and visualize in the dashboard![0m


Question: What did the president say about Ketanji Brown Jackson
Response: The President mentioned that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson to serve on the United States Supreme Court 4 days ago. He described her as one of the nation's top legal minds who will continue Justice Breyer’s legacy of excellence.

Context Relevance Score: 1.0
Factual Accuracy Score: 1.0
Response Completeness Score: 0.5
```
