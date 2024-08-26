---
translated: true
---

# MongoDB Atlas

>[MongoDB Atlas](https://www.mongodb.com/docs/atlas/) は、AWS、Azure、GCP で利用可能な完全に管理されたクラウドデータベースです。MongoDB ドキュメントデータに対するネイティブベクトル検索のサポートが追加されました。

このノートブックでは、[MongoDB Atlas ベクトル検索](https://www.mongodb.com/products/platform/atlas-vector-search)を使用して、埋め込みをMongoDB ドキュメントに格納し、ベクトル検索インデックスを作成し、近似最近傍アルゴリズム(`Hierarchical Navigable Small Worlds`)を使用してKNN検索を実行する方法を示します。これは、[$vectorSearch MQLステージ](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)を使用しています。

MongoDB Atlasを使用するには、最初にクラスターをデプロイする必要があります。無料永久プランのクラスターをご利用いただけます。開始するには、[クイックスタート](https://www.mongodb.com/docs/atlas/getting-started/)に移動してください。

> 注意:
>
>* 詳細なドキュメントは[LangChain-MongoDB site](https://www.mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/)にあります
>* この機能は一般提供されており、本番環境での使用が可能です。
>* LangChain バージョン 0.0.305 ([リリースノート](https://github.com/langchain-ai/langchain/releases/tag/v0.0.305)))では、$vectorSearch MQLステージのサポートが導入されました。これは、MongoDB Atlas 6.0.11 および 7.0.2 で利用可能です。より古いバージョンのMongoDB Atlasを使用しているユーザーは、LangChainのバージョンを <=0.0.304 に固定する必要があります。
>

このノートブックでは、MongoDB Atlas、OpenAI、Langchainを使用して、`Retrieval Augmented Generation`(RAG)を実演します。2023年3月に公開された[GPT 4 technical report](https://arxiv.org/pdf/2303.08774.pdf)に対して、類似検索、メタデータプリフィルタリングを使った類似検索、および質問応答を行います。このレポートは、OpenAIの大規模言語モデル(LLM)のパラメトリックメモリに含まれていません。LLMの知識カットオフは2021年9月です。

`OpenAIEmbeddings`を使用するには、OpenAI APIキーを設定する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

次に、MongoDB Atlasクラスターの環境変数を設定します。

```python
%pip install --upgrade --quiet  langchain pypdf pymongo langchain-openai tiktoken
```

```python
import getpass

MONGODB_ATLAS_CLUSTER_URI = getpass.getpass("MongoDB Atlas Cluster URI:")
```

```python
from pymongo import MongoClient

# initialize MongoDB python client
client = MongoClient(MONGODB_ATLAS_CLUSTER_URI)

DB_NAME = "langchain_db"
COLLECTION_NAME = "test"
ATLAS_VECTOR_SEARCH_INDEX_NAME = "index_name"

MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]
```

## ベクトル検索インデックスの作成

次に、クラスターにベクトル検索インデックスを作成しましょう。詳細な手順は、[Create Vector Search Index for LangChain](https://www.mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/#create-the-atlas-vector-search-index)セクションにあります。
以下の例では、`embedding`がベクトル埋め込みを含むフィールドの名前です。インデックスの定義の詳細については、[ドキュメント](https://www.mongodb.com/docs/atlas/atlas-vector-search/create-index/)を参照してください。
インデックスの名前を`{ATLAS_VECTOR_SEARCH_INDEX_NAME}`とし、名前空間`{DB_NAME}.{COLLECTION_NAME}`でインデックスを作成できます。最後に、MongoDB AtlasのJSON エディターに以下の定義を書き込みます。

```json
{
  "fields":[
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

# データの挿入

```python
from langchain_community.document_loaders import PyPDFLoader

# Load the PDF
loader = PyPDFLoader("https://arxiv.org/pdf/2303.08774.pdf")
data = loader.load()
```

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
docs = text_splitter.split_documents(data)
```

```python
print(docs[0])
```

```python
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings

# insert the documents in MongoDB Atlas with their embedding
vector_search = MongoDBAtlasVectorSearch.from_documents(
    documents=docs,
    embedding=OpenAIEmbeddings(disallowed_special=()),
    collection=MONGODB_COLLECTION,
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
)
```

```python
# Perform a similarity search between the embedding of the query and the embeddings of the documents
query = "What were the compute requirements for training GPT 4"
results = vector_search.similarity_search(query)

print(results[0].page_content)
```

# データの照会

ベクトルストアを直接インスタンス化し、クエリを実行することもできます。

```python
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings

vector_search = MongoDBAtlasVectorSearch.from_connection_string(
    MONGODB_ATLAS_CLUSTER_URI,
    DB_NAME + "." + COLLECTION_NAME,
    OpenAIEmbeddings(disallowed_special=()),
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
)
```

## メタデータプリフィルタリングを使った類似検索

Atlas ベクトル検索では、MQLオペレーターを使ってメタデータフィルタリングができます。以下は、上記でロードしたデータに対して、"page"フィールドでメタデータフィルタリングを行うインデックスとクエリの例です。既存のインデックスにフィルターを追加し、ベクトル検索とプリフィルタリングを行うことができます。

```json
{
  "fields":[
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "page"
    }
  ]
}
```

```python
query = "What were the compute requirements for training GPT 4"

results = vector_search.similarity_search_with_score(
    query=query, k=5, pre_filter={"page": {"$eq": 1}}
)

# Display results
for result in results:
    print(result)
```

## スコア付きの類似検索

```python
query = "What were the compute requirements for training GPT 4"

results = vector_search.similarity_search_with_score(
    query=query,
    k=5,
)

# Display results
for result in results:
    print(result)
```

## 質問応答

```python
qa_retriever = vector_search.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 25},
)
```

```python
from langchain_core.prompts import PromptTemplate

prompt_template = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
"""
PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)
```

```python
from langchain.chains import RetrievalQA
from langchain_openai import OpenAI

qa = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    chain_type="stuff",
    retriever=qa_retriever,
    return_source_documents=True,
    chain_type_kwargs={"prompt": PROMPT},
)

docs = qa({"query": "gpt-4 compute requirements"})

print(docs["result"])
print(docs["source_documents"])
```

GPT-4は以前のGPTモデルよりも大幅に多くのコンピューティング能力を必要とします。OpenAIの内部コードベースから派生したデータセットでは、GPT-4は最低損失に達するために100p(ペタフロップス)のコンピューティング能力を必要としますが、より小さなモデルは1-10n(ナノフロップス)で済みます。
