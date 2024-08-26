---
translated: true
---

# DingoDB

>[DingoDB](https://dingodb.readthedocs.io/en/latest/)は、データレイクとベクトルデータベースの特性を組み合わせた分散型マルチモードベクトルデータベースです。あらゆるタイプとサイズのデータ(Key-Value、PDF、音声、ビデオなど)を格納できます。低レイテンシーの実時間処理機能を備え、迅速な洞察と対応を実現し、マルチモーダルデータの即時分析と処理を効率的に行うことができます。

このノートブックでは、DingoDB ベクトルデータベースに関連する機能の使用方法を示します。

実行するには、[DingoDB インスタンスが起動している](https://github.com/dingodb/dingo-deploy/blob/main/README.md)必要があります。

```python
%pip install --upgrade --quiet  dingodb
# or install latest:
%pip install --upgrade --quiet  git+https://git@github.com/dingodb/pydingo.git
```

OpenAIEmbeddingsを使用したいので、OpenAI APIキーを取得する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key:········
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Dingo
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
from dingodb import DingoDB

index_name = "langchain_demo"

dingo_client = DingoDB(user="", password="", host=["127.0.0.1:13000"])
# First, check if our index already exists. If it doesn't, we create it
if (
    index_name not in dingo_client.get_index()
    and index_name.upper() not in dingo_client.get_index()
):
    # we create a new index, modify to your own
    dingo_client.create_index(
        index_name=index_name, dimension=1536, metric_type="cosine", auto_id=False
    )

# The OpenAI embedding model `text-embedding-ada-002 uses 1536 dimensions`
docsearch = Dingo.from_documents(
    docs, embeddings, client=dingo_client, index_name=index_name
)
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Dingo
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```python
print(docs[0].page_content)
```

### 既存のインデックスにさらにテキストを追加する

`add_texts`関数を使用して、既存のDingoインデックスにさらにテキストをエンベディングしてアップサートできます。

```python
vectorstore = Dingo(embeddings, "text", client=dingo_client, index_name=index_name)

vectorstore.add_texts(["More text!"])
```

### 最大限の限界関連性検索

リトリーバーオブジェクトでの類似性検索に加えて、`mmr`もリトリーバーとして使用できます。

```python
retriever = docsearch.as_retriever(search_type="mmr")
matched_docs = retriever.invoke(query)
for i, d in enumerate(matched_docs):
    print(f"\n## Document {i}\n")
    print(d.page_content)
```

または、`max_marginal_relevance_search`を直接使用することもできます:

```python
found_docs = docsearch.max_marginal_relevance_search(query, k=2, fetch_k=10)
for i, doc in enumerate(found_docs):
    print(f"{i + 1}.", doc.page_content, "\n")
```
