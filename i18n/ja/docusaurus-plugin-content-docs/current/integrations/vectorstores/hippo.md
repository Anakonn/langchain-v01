---
translated: true
---

# Hippo

>[Transwarp Hippo](https://www.transwarp.cn/en/subproduct/hippo)は、大規模なベクトルデータセットの保存、検索、管理を可能にする、エンタープライズレベルのクラウドネイティブ分散ベクトルデータベースです。ベクトル類似検索や高密度ベクトルクラスタリングなどの問題を効率的に解決します。`Hippo`は高可用性、高パフォーマンス、簡単なスケーラビリティを備えています。複数のベクトル検索インデックス、データパーティショニングとシャーディング、データパーシスタンス、増分データインジェスト、ベクトルスカラーフィールドフィルタリング、混合クエリなどの機能を備えています。大規模なベクトルデータに対する企業の高リアルタイム検索ニーズを効果的に満たすことができます。

## はじめに

ここで必要な前提条件は、OpenAIのウェブサイトからAPIキーを取得することです。Hippoのインスタンスを既に起動していることを確認してください。

## 依存関係のインストール

最初に、OpenAI、Langchain、Hippo-APIなどの依存関係をインストールする必要があります。お使いの環境に合わせて適切なバージョンをインストールしてください。

```python
%pip install --upgrade --quiet  langchain tiktoken langchain-openai
%pip install --upgrade --quiet  hippo-api==1.1.0.rc3
```

```output
Requirement already satisfied: hippo-api==1.1.0.rc3 in /Users/daochengzhang/miniforge3/envs/py310/lib/python3.10/site-packages (1.1.0rc3)
Requirement already satisfied: pyyaml>=6.0 in /Users/daochengzhang/miniforge3/envs/py310/lib/python3.10/site-packages (from hippo-api==1.1.0.rc3) (6.0.1)
```

注意: Pythonのバージョンは3.8以上である必要があります。

## ベストプラクティス

### 依存関係パッケージのインポート

```python
import os

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.hippo import Hippo
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### 知識文書の読み込み

```python
os.environ["OPENAI_API_KEY"] = "YOUR OPENAI KEY"
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
```

### 知識文書のセグメンテーション

ここでは、Langchainのcharactertextsplitterを使ってセグメンテーションを行います。区切り文字はピリオドです。セグメンテーション後、テキストセグメントは1000文字を超えず、重複文字数は0です。

```python
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

### 埋め込みモデルの宣言

以下では、LangchainのOpenAIEmbeddingsメソッドを使ってOpenAIまたはAzureの埋め込みモデルを作成しています。

```python
# openai
embeddings = OpenAIEmbeddings()
# azure
# embeddings = OpenAIEmbeddings(
#     openai_api_type="azure",
#     openai_api_base="x x x",
#     openai_api_version="x x x",
#     model="x x x",
#     deployment="x x x",
#     openai_api_key="x x x"
# )
```

### Hippoクライアントの宣言

```python
HIPPO_CONNECTION = {"host": "IP", "port": "PORT"}
```

### 文書の保存

```python
print("input...")
# insert docs
vector_store = Hippo.from_documents(
    docs,
    embedding=embeddings,
    table_name="langchain_test",
    connection_args=HIPPO_CONNECTION,
)
print("success")
```

```output
input...
success
```

### 知識ベースの質問応答

#### 大規模言語質問応答モデルの作成

以下では、LangchainのAzureChatOpenAIとChatOpenAIメソッドを使ってOpenAIまたはAzureの大規模言語質問応答モデルをそれぞれ作成しています。

```python
# llm = AzureChatOpenAI(
#     openai_api_base="x x x",
#     openai_api_version="xxx",
#     deployment_name="xxx",
#     openai_api_key="xxx",
#     openai_api_type="azure"
# )

llm = ChatOpenAI(openai_api_key="YOUR OPENAI KEY", model_name="gpt-3.5-turbo-16k")
```

### 質問に基づいた関連知識の取得：

```python
query = "Please introduce COVID-19"
# query = "Please introduce Hippo Core Architecture"
# query = "What operations does the Hippo Vector Database support for vector data?"
# query = "Does Hippo use hardware acceleration technology? Briefly introduce hardware acceleration technology."


# Retrieve similar content from the knowledge base,fetch the top two most similar texts.
res = vector_store.similarity_search(query, 2)
content_list = [item.page_content for item in res]
text = "".join(content_list)
```

### プロンプトテンプレートの構築

```python
prompt = f"""
Please use the content of the following [Article] to answer my question. If you don't know, please say you don't know, and the answer should be concise."
[Article]:{text}
Please answer this question in conjunction with the above article:{query}
"""
```

### 大規模言語モデルによる回答生成の待機

```python
response_with_hippo = llm.predict(prompt)
print(f"response_with_hippo:{response_with_hippo}")
response = llm.predict(query)
print("==========================================")
print(f"response_without_hippo:{response}")
```

```output
response_with_hippo:COVID-19 is a virus that has impacted every aspect of our lives for over two years. It is a highly contagious and mutates easily, requiring us to remain vigilant in combating its spread. However, due to progress made and the resilience of individuals, we are now able to move forward safely and return to more normal routines.
==========================================
response_without_hippo:COVID-19 is a contagious respiratory illness caused by the novel coronavirus SARS-CoV-2. It was first identified in December 2019 in Wuhan, China and has since spread globally, leading to a pandemic. The virus primarily spreads through respiratory droplets when an infected person coughs, sneezes, talks, or breathes, and can also spread by touching contaminated surfaces and then touching the face. COVID-19 symptoms include fever, cough, shortness of breath, fatigue, muscle or body aches, sore throat, loss of taste or smell, headache, and in severe cases, pneumonia and organ failure. While most people experience mild to moderate symptoms, it can lead to severe illness and even death, particularly among older adults and those with underlying health conditions. To combat the spread of the virus, various preventive measures have been implemented globally, including social distancing, wearing face masks, practicing good hand hygiene, and vaccination efforts.
```
