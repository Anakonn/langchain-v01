---
translated: true
---

# Yellowbrick

[Yellowbrick](https://yellowbrick.com/yellowbrick-data-warehouse/)は、Kubernetesを使ってスケーラビリティ、レジリエンス、クラウドポータビリティを実現する、クラウドおよびオンプレミスで動作する弾力的な大規模並列処理(MPP)SQLデータベースです。Yellowbrickは、最大規模で最も複雑なビジネス上重要なデータウェアハウジングのユースケースに対処するように設計されています。Yellowbrickが提供するスケールでの効率性により、ベクトルデータベースとしても使用でき、SQLを使ってベクトルを保存および検索することができます。

## YellowbrickをベクトルストアとしてChatGptで使用する

このチュートリアルでは、Yellowbrickをベクトルストアとして使用し、Retrieval Augmented Generation (RAG)をサポートするChatGptバックエンドのシンプルなチャットボットを作成する方法を示します。必要なものは以下の通りです:

1. [Yellowbrick sandbox](https://cloudlabs.yellowbrick.com/)のアカウント
2. [OpenAI](https://platform.openai.com/)のAPIキー

このチュートリアルは5つのパートに分かれています。まず、ベクトルストアなしでChatGptと対話するベースラインのチャットボットを作成します。次に、Yellowbrickにエンベディングテーブルを作成し、ベクトルストアを表します。3つ目は、一連のドキュメント(Yellowbrickマニュアルの管理章)をロードします。4つ目は、それらのドキュメントのベクトル表現を作成し、Yellowbrickのテーブルに格納します。最後に、同じクエリを改善されたチャットボックスに送信し、結果を確認します。

```python
# Install all needed libraries
%pip install --upgrade --quiet  langchain
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  psycopg2-binary
%pip install --upgrade --quiet  tiktoken
```

## セットアップ: YellowbrickとOpenAI APIに接続するための情報を入力する

私たちのチャットボットはlangchainライブラリを介してChatGptと統合されているため、まずOpenAIからAPIキーを取得する必要があります:

OpenAIのAPIキーを取得するには:
1. https://platform.openai.com/で登録する
2. 支払い方法を追加する - 無料枠を超えることはまずありません
3. APIキーを作成する

また、Yellowbrick Sandboxアカウントに登録したときのウェルカメールに記載されているユーザー名、パスワード、データベース名も必要です。

以下の内容は、ご自身のYellowbrickデータベースとOpenAPIキーの情報に修正する必要があります。

```python
# Modify these values to match your Yellowbrick Sandbox and OpenAI API Key
YBUSER = "[SANDBOX USER]"
YBPASSWORD = "[SANDBOX PASSWORD]"
YBDATABASE = "[SANDBOX_DATABASE]"
YBHOST = "trialsandbox.sandbox.aws.yellowbrickcloud.com"

OPENAI_API_KEY = "[OPENAI API KEY]"
```

```python
# Import libraries and setup keys / login info
import os
import pathlib
import re
import sys
import urllib.parse as urlparse
from getpass import getpass

import psycopg2
from IPython.display import Markdown, display
from langchain.chains import LLMChain, RetrievalQAWithSourcesChain
from langchain.schema import Document
from langchain_community.vectorstores import Yellowbrick
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Establish connection parameters to Yellowbrick.  If you've signed up for Sandbox, fill in the information from your welcome mail here:
yellowbrick_connection_string = (
    f"postgres://{urlparse.quote(YBUSER)}:{YBPASSWORD}@{YBHOST}:5432/{YBDATABASE}"
)

YB_DOC_DATABASE = "sample_data"
YB_DOC_TABLE = "yellowbrick_documentation"
embedding_table = "my_embeddings"

# API Key for OpenAI.  Signup at https://platform.openai.com
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
```

## パート1: ベクトルストアなしでChatGptバックエンドのベースラインチャットボットを作成する

langchainを使ってChatGPTにクエリを送ります。ベクトルストアがないため、ChatGPTはクエリに対する文脈を持ちません。

```python
# Set up the chat model and specific prompt
system_template = """If you don't know the answer, Make up your best guess."""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

chain_type_kwargs = {"prompt": prompt}
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",  # Modify model_name if you have access to GPT-4
    temperature=0,
    max_tokens=256,
)

chain = LLMChain(
    llm=llm,
    prompt=prompt,
    verbose=False,
)


def print_result_simple(query):
    result = chain(query)
    output_text = f"""### Question:
  {query}
  ### Answer:
  {result['text']}
    """
    display(Markdown(output_text))


# Use the chain to query
print_result_simple("How many databases can be in a Yellowbrick Instance?")

print_result_simple("What's an easy way to add users in bulk to Yellowbrick?")
```

## パート2: Yellowbrickに接続し、エンベディングテーブルを作成する

ドキュメントのエンベディングをYellowbrickにロードするには、それらを格納するためのテーブルを作成する必要があります。テーブルが格納されるYellowbrickデータベースはUTF-8エンコーディングである必要があります。

以下のスキーマを持つUTF-8エンコーディングのデータベースにテーブルを作成してください。テーブル名は任意のものを使用してください:

```python
# Establish a connection to the Yellowbrick database
try:
    conn = psycopg2.connect(yellowbrick_connection_string)
except psycopg2.Error as e:
    print(f"Error connecting to the database: {e}")
    exit(1)

# Create a cursor object using the connection
cursor = conn.cursor()

# Define the SQL statement to create a table
create_table_query = f"""
CREATE TABLE IF NOT EXISTS {embedding_table} (
    doc_id uuid NOT NULL,
    embedding_id smallint NOT NULL,
    embedding double precision NOT NULL
)
DISTRIBUTE ON (doc_id);
truncate table {embedding_table};
"""

# Execute the SQL query to create a table
try:
    cursor.execute(create_table_query)
    print(f"Table '{embedding_table}' created successfully!")
except psycopg2.Error as e:
    print(f"Error creating table: {e}")
    conn.rollback()

# Commit changes and close the cursor and connection
conn.commit()
cursor.close()
conn.close()
```

## パート3: Yellowbrickの既存のテーブルからインデックス化するドキュメントを抽出する

Yellowbrickのテーブルからドキュメントのパスとコンテンツを抽出します。次のステップでこれらのドキュメントからエンベディングを作成します。

```python
yellowbrick_doc_connection_string = (
    f"postgres://{urlparse.quote(YBUSER)}:{YBPASSWORD}@{YBHOST}:5432/{YB_DOC_DATABASE}"
)

print(yellowbrick_doc_connection_string)

# Establish a connection to the Yellowbrick database
conn = psycopg2.connect(yellowbrick_doc_connection_string)

# Create a cursor object
cursor = conn.cursor()

# Query to select all documents from the table
query = f"SELECT path, document FROM {YB_DOC_TABLE}"

# Execute the query
cursor.execute(query)

# Fetch all documents
yellowbrick_documents = cursor.fetchall()

print(f"Extracted {len(yellowbrick_documents)} documents successfully!")

# Close the cursor and connection
cursor.close()
conn.close()
```

## パート4: Yellowbrickベクトルストアにドキュメントをロードする

ドキュメントを処理し、消化可能な塊に分割し、エンベディングを作成してYellowbrickのテーブルに挿入します。これには約5分かかります。

```python
# Split documents into chunks for conversion to embeddings
DOCUMENT_BASE_URL = "https://docs.yellowbrick.com/6.7.1/"  # Actual URL


separator = "\n## "  # This separator assumes Markdown docs from the repo uses ### as logical main header most of the time
chunk_size_limit = 2000
max_chunk_overlap = 200

documents = [
    Document(
        page_content=document[1],
        metadata={"source": DOCUMENT_BASE_URL + document[0].replace(".md", ".html")},
    )
    for document in yellowbrick_documents
]

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size_limit,
    chunk_overlap=max_chunk_overlap,
    separators=[separator, "\nn", "\n", ",", " ", ""],
)
split_docs = text_splitter.split_documents(documents)

docs_text = [doc.page_content for doc in split_docs]

embeddings = OpenAIEmbeddings()
vector_store = Yellowbrick.from_documents(
    documents=split_docs,
    embedding=embeddings,
    connection_info=yellowbrick_connection_string,
    table=embedding_table,
)

print(f"Created vector store with {len(documents)} documents")
```

## パート5: Yellowbrickをベクトルストアとして使用するチャットボットの作成

次に、ベクトルストアとしてYellowbrickを追加します。ベクトルストアには、Yellowbrickプロダクトドキュメンテーションの管理章を表すエンベディングが格納されています。

上記と同じクエリを送信し、改善された応答を確認します。

```python
system_template = """Use the following pieces of context to answer the users question.
Take note of the sources and include them in the answer in the format: "SOURCES: source1 source2", use "SOURCES" in capital letters regardless of the number of sources.
If you don't know the answer, just say that "I don't know", don't try to make up an answer.
----------------
{summaries}"""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

vector_store = Yellowbrick(
    OpenAIEmbeddings(),
    yellowbrick_connection_string,
    embedding_table,  # Change the table name to reflect your embeddings
)

chain_type_kwargs = {"prompt": prompt}
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",  # Modify model_name if you have access to GPT-4
    temperature=0,
    max_tokens=256,
)
chain = RetrievalQAWithSourcesChain.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,
    chain_type_kwargs=chain_type_kwargs,
)


def print_result_sources(query):
    result = chain(query)
    output_text = f"""### Question:
  {query}
  ### Answer:
  {result['answer']}
  ### Sources:
  {result['sources']}
  ### All relevant sources:
  {', '.join(list(set([doc.metadata['source'] for doc in result['source_documents']])))}
    """
    display(Markdown(output_text))


# Use the chain to query

print_result_sources("How many databases can be in a Yellowbrick Instance?")

print_result_sources("Whats an easy way to add users in bulk to Yellowbrick?")
```

## パート6: パフォーマンス向上のためのインデックスの導入

Yellowbrickは、Locality-Sensitive Hashingアプローチを使ったインデックス化もサポートしています。これは近似最近傍検索の手法で、精度を犠牲にすることで検索時間を短縮できます。インデックスには2つの調整可能なパラメーターが導入されています:

- ハイパープレーンの数は、`create_lsh_index(num_hyperplanes)`の引数として指定します。ドキュメントが多いほど、より多くのハイパープレーンが必要です。LSHは次元削減の一種です。オリジナルのエンベディングは、ハイパープレーンの数と同じ次元数の低次元ベクトルに変換されます。
- ハミング距離は、検索の幅を表す整数です。ハミング距離が小さいほど、検索が高速になりますが精度は低下します。

Yellowbrickにロードしたエンベディングにインデックスを作成する方法を以下に示します。前回のチャットセッションを再実行しますが、今回はインデックスを使った検索を行います。このようなドキュメント数が少ない場合、インデックスによるパフォーマンス向上は見られないことに注意してください。

```python
system_template = """Use the following pieces of context to answer the users question.
Take note of the sources and include them in the answer in the format: "SOURCES: source1 source2", use "SOURCES" in capital letters regardless of the number of sources.
If you don't know the answer, just say that "I don't know", don't try to make up an answer.
----------------
{summaries}"""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

vector_store = Yellowbrick(
    OpenAIEmbeddings(),
    yellowbrick_connection_string,
    embedding_table,  # Change the table name to reflect your embeddings
)

lsh_params = Yellowbrick.IndexParams(
    Yellowbrick.IndexType.LSH, {"num_hyperplanes": 8, "hamming_distance": 2}
)
vector_store.create_index(lsh_params)

chain_type_kwargs = {"prompt": prompt}
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",  # Modify model_name if you have access to GPT-4
    temperature=0,
    max_tokens=256,
)
chain = RetrievalQAWithSourcesChain.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(
        k=5, search_kwargs={"index_params": lsh_params}
    ),
    return_source_documents=True,
    chain_type_kwargs=chain_type_kwargs,
)


def print_result_sources(query):
    result = chain(query)
    output_text = f"""### Question:
  {query}
  ### Answer:
  {result['answer']}
  ### Sources:
  {result['sources']}
  ### All relevant sources:
  {', '.join(list(set([doc.metadata['source'] for doc in result['source_documents']])))}
    """
    display(Markdown(output_text))


# Use the chain to query

print_result_sources("How many databases can be in a Yellowbrick Instance?")

print_result_sources("Whats an easy way to add users in bulk to Yellowbrick?")
```

## 次のステップ:

このコードを修正して、異なる質問を行うことができます。独自のドキュメントをベクトルストアにロードすることもできます。langchainモジュールは非常に柔軟で、HTML、PDF等、さまざまなファイル形式を解析できます。

また、Hugging FaceのエンベディングモデルやMeta's Llama 2 LLMを使用して、完全にプライベートなチャットボックス体験を実現するように変更することもできます。
