---
translated: true
---

# vlite

VLiteは、埋め込みを使用してデータをセマンティックに保存および取得できる、シンプルで高速なベクトルデータベースです。 numpyで作られたVLiteは、RAG、類似性検索、埋め込みをプロジェクトに実装するための軽量なバッテリー付きデータベースです。

## インストール

LangChainでVLiteを使用するには、`vlite`パッケージをインストールする必要があります:

```bash
!pip install vlite
```

## VLiteのインポート

```python
from langchain.vectorstores import VLite
```

## 基本的な例

この基本的な例では、テキストドキュメントを読み込み、VLiteベクトルデータベースに保存します。 次に、クエリに基づいて関連するドキュメントを取得するために、類似性検索を実行します。

VLiteはテキストのチャンキングと埋め込みを処理し、これらのパラメーターはテキストの事前チャンキングや埋め込みによって変更できます。

```python
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter

# Load the document and split it into chunks
loader = TextLoader("path/to/document.txt")
documents = loader.load()

# Create a VLite instance
vlite = VLite(collection="my_collection")

# Add documents to the VLite vector database
vlite.add_documents(documents)

# Perform a similarity search
query = "What is the main topic of the document?"
docs = vlite.similarity_search(query)

# Print the most relevant document
print(docs[0].page_content)
```

## テキストとドキュメントの追加

`add_texts`および`add_documents`メソッドを使用して、VLiteベクトルデータベースにテキストまたはドキュメントを追加できます。

```python
# Add texts to the VLite vector database
texts = ["This is the first text.", "This is the second text."]
vlite.add_texts(texts)

# Add documents to the VLite vector database
documents = [Document(page_content="This is a document.", metadata={"source": "example.txt"})]
vlite.add_documents(documents)
```

## 類似性検索

VLiteは、保存されたドキュメントに対する類似性検索を実行するためのメソッドを提供します。

```python
# Perform a similarity search
query = "What is the main topic of the document?"
docs = vlite.similarity_search(query, k=3)

# Perform a similarity search with scores
docs_with_scores = vlite.similarity_search_with_score(query, k=3)
```

## 最大限の関連性検索

VLiteは、クエリとの類似性と取得されたドキュメントの多様性の両方を最適化する、最大限の関連性(MMR)検索もサポートしています。

```python
# Perform an MMR search
docs = vlite.max_marginal_relevance_search(query, k=3)
```

## ドキュメントの更新と削除

`update_document`および`delete`メソッドを使用して、VLiteベクトルデータベース内のドキュメントを更新または削除できます。

```python
# Update a document
document_id = "doc_id_1"
updated_document = Document(page_content="Updated content", metadata={"source": "updated.txt"})
vlite.update_document(document_id, updated_document)

# Delete documents
document_ids = ["doc_id_1", "doc_id_2"]
vlite.delete(document_ids)
```

## ドキュメントの取得

`get`メソッドを使用して、IDまたはメタデータに基づいてVLiteベクトルデータベースからドキュメントを取得できます。

```python
# Retrieve documents by IDs
document_ids = ["doc_id_1", "doc_id_2"]
docs = vlite.get(ids=document_ids)

# Retrieve documents by metadata
metadata_filter = {"source": "example.txt"}
docs = vlite.get(where=metadata_filter)
```

## VLiteインスタンスの作成

さまざまな方法を使用してVLiteインスタンスを作成できます:

```python
# Create a VLite instance from texts
vlite = VLite.from_texts(texts)

# Create a VLite instance from documents
vlite = VLite.from_documents(documents)

# Create a VLite instance from an existing index
vlite = VLite.from_existing_index(collection="existing_collection")
```

## その他の機能

VLiteは、ベクトルデータベースの管理に関するその他の機能を提供します:

```python
from langchain.vectorstores import VLite
vlite = VLite(collection="my_collection")

# Get the number of items in the collection
count = vlite.count()

# Save the collection
vlite.save()

# Clear the collection
vlite.clear()

# Get collection information
vlite.info()

# Dump the collection data
data = vlite.dump()
```
