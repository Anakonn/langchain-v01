---
translated: true
---

# Marqo

このノートブックでは、Marqoベクトルストアに関連する機能の使用方法を示します。

>[Marqo](https://www.marqo.ai/)は、オープンソースのベクトル検索エンジンです。Marqoを使うと、テキストや画像などのマルチモーダルなデータを保存およびクエリできます。Marqoは、大量のオープンソースモデルを使ってベクトルを作成してくれます。独自のファインチューンドモデルを提供することもでき、Marqoがそれをロードして推論を行います。

このノートブックをDockerイメージで実行するには、まずMarqoを取得するために次のコマンドを実行してください:

```bash
docker pull marqoai/marqo:latest
docker rm -f marqo
docker run --name marqo -it --privileged -p 8882:8882 --add-host host.docker.internal:host-gateway marqoai/marqo:latest
```

```python
%pip install --upgrade --quiet  marqo
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Marqo
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
import marqo

# initialize marqo
marqo_url = "http://localhost:8882"  # if using marqo cloud replace with your endpoint (console.marqo.ai)
marqo_api_key = ""  # if using marqo cloud replace with your api key (console.marqo.ai)

client = marqo.Client(url=marqo_url, api_key=marqo_api_key)

index_name = "langchain-demo"

docsearch = Marqo.from_documents(docs, index_name=index_name)

query = "What did the president say about Ketanji Brown Jackson"
result_docs = docsearch.similarity_search(query)
```

```output
Index langchain-demo exists.
```

```python
print(result_docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

```python
result_docs = docsearch.similarity_search_with_score(query)
print(result_docs[0][0].page_content, result_docs[0][1], sep="\n")
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
0.68647254
```

## 追加機能

Marqoベクトルストアの強力な機能の1つは、外部で作成されたインデックスを使用できることです。例えば:

+ 別のアプリケーションから画像とテキストのペアのデータベースがある場合、それをそのままLangChainのMarqoベクトルストアで使用できます。ただし、マルチモーダルなインデックスを使用すると、`add_texts`メソッドは無効になります。

+ テキストドキュメントのデータベースがある場合、それをLangChainフレームワークに取り込み、`add_texts`で追加のテキストを追加できます。

返されるドキュメントは、検索メソッドの`page_content_builder`コールバックに独自の関数を渡すことで、カスタマイズできます。

#### マルチモーダルの例

```python
# use a new index
index_name = "langchain-multimodal-demo"

# incase the demo is re-run
try:
    client.delete_index(index_name)
except Exception:
    print(f"Creating {index_name}")

# This index could have been created by another system
settings = {"treat_urls_and_pointers_as_images": True, "model": "ViT-L/14"}
client.create_index(index_name, **settings)
client.index(index_name).add_documents(
    [
        # image of a bus
        {
            "caption": "Bus",
            "image": "https://raw.githubusercontent.com/marqo-ai/marqo/mainline/examples/ImageSearchGuide/data/image4.jpg",
        },
        # image of a plane
        {
            "caption": "Plane",
            "image": "https://raw.githubusercontent.com/marqo-ai/marqo/mainline/examples/ImageSearchGuide/data/image2.jpg",
        },
    ],
)
```

```output
{'errors': False,
 'processingTimeMs': 2090.2822139996715,
 'index_name': 'langchain-multimodal-demo',
 'items': [{'_id': 'aa92fc1c-1fb2-4d86-b027-feb507c419f7',
   'result': 'created',
   'status': 201},
  {'_id': '5142c258-ef9f-4bf2-a1a6-2307280173a0',
   'result': 'created',
   'status': 201}]}
```

```python
def get_content(res):
    """Helper to format Marqo's documents into text to be used as page_content"""
    return f"{res['caption']}: {res['image']}"


docsearch = Marqo(client, index_name, page_content_builder=get_content)


query = "vehicles that fly"
doc_results = docsearch.similarity_search(query)
```

```python
for doc in doc_results:
    print(doc.page_content)
```

```output
Plane: https://raw.githubusercontent.com/marqo-ai/marqo/mainline/examples/ImageSearchGuide/data/image2.jpg
Bus: https://raw.githubusercontent.com/marqo-ai/marqo/mainline/examples/ImageSearchGuide/data/image4.jpg
```

#### テキストのみの例

```python
# use a new index
index_name = "langchain-byo-index-demo"

# incase the demo is re-run
try:
    client.delete_index(index_name)
except Exception:
    print(f"Creating {index_name}")

# This index could have been created by another system
client.create_index(index_name)
client.index(index_name).add_documents(
    [
        {
            "Title": "Smartphone",
            "Description": "A smartphone is a portable computer device that combines mobile telephone "
            "functions and computing functions into one unit.",
        },
        {
            "Title": "Telephone",
            "Description": "A telephone is a telecommunications device that permits two or more users to"
            "conduct a conversation when they are too far apart to be easily heard directly.",
        },
    ],
)
```

```output
{'errors': False,
 'processingTimeMs': 139.2144540004665,
 'index_name': 'langchain-byo-index-demo',
 'items': [{'_id': '27c05a1c-b8a9-49a5-ae73-fbf1eb51dc3f',
   'result': 'created',
   'status': 201},
  {'_id': '6889afe0-e600-43c1-aa3b-1d91bf6db274',
   'result': 'created',
   'status': 201}]}
```

```python
# Note text indexes retain the ability to use add_texts despite different field names in documents
# this is because the page_content_builder callback lets you handle these document fields as required


def get_content(res):
    """Helper to format Marqo's documents into text to be used as page_content"""
    if "text" in res:
        return res["text"]
    return res["Description"]


docsearch = Marqo(client, index_name, page_content_builder=get_content)

docsearch.add_texts(["This is a document that is about elephants"])
```

```output
['9986cc72-adcd-4080-9d74-265c173a9ec3']
```

```python
query = "modern communications devices"
doc_results = docsearch.similarity_search(query)

print(doc_results[0].page_content)
```

```output
A smartphone is a portable computer device that combines mobile telephone functions and computing functions into one unit.
```

```python
query = "elephants"
doc_results = docsearch.similarity_search(query, page_content_builder=get_content)

print(doc_results[0].page_content)
```

```output
This is a document that is about elephants
```

## 重み付きクエリ

Marqoの重み付きクエリも公開しており、複雑なセマンティック検索を構築する強力な方法です。

```python
query = {"communications devices": 1.0}
doc_results = docsearch.similarity_search(query)
print(doc_results[0].page_content)
```

```output
A smartphone is a portable computer device that combines mobile telephone functions and computing functions into one unit.
```

```python
query = {"communications devices": 1.0, "technology post 2000": -1.0}
doc_results = docsearch.similarity_search(query)
print(doc_results[0].page_content)
```

```output
A telephone is a telecommunications device that permits two or more users toconduct a conversation when they are too far apart to be easily heard directly.
```

# ソースを使った質問応答

このセクションでは、`RetrievalQAWithSourcesChain`の一部としてMarqoを使う方法を示します。Marqoが情報源の検索を行います。

```python
import getpass
import os

from langchain.chains import RetrievalQAWithSourcesChain
from langchain_openai import OpenAI

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key:········
```

```python
with open("../../modules/state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```

```python
index_name = "langchain-qa-with-retrieval"
docsearch = Marqo.from_documents(docs, index_name=index_name)
```

```output
Index langchain-qa-with-retrieval exists.
```

```python
chain = RetrievalQAWithSourcesChain.from_chain_type(
    OpenAI(temperature=0), chain_type="stuff", retriever=docsearch.as_retriever()
)
```

```python
chain(
    {"question": "What did the president say about Justice Breyer"},
    return_only_outputs=True,
)
```

```output
{'answer': ' The president honored Justice Breyer, thanking him for his service and noting that he is a retiring Justice of the United States Supreme Court.\n',
 'sources': '../../../state_of_the_union.txt'}
```
