---
translated: true
---

# 親ドキュメントリトリーバー

ドキュメントを検索のために分割する際、しばしば相反する要求があります:

1. 意味を最も正確に反映できるよう、小さなドキュメントを持つことが望ましい。長すぎると、エンベディングが意味を失う可能性があります。
2. 各チャンクのコンテキストが保持されるよう、十分に長いドキュメントを持つことが望ましい。

`ParentDocumentRetriever`は、小さなデータチャンクを分割して保存することでこのバランスを取ります。検索時は、まず小さなチャンクを取得し、それらのチャンクの親IDを検索して、より大きなドキュメントを返します。

「親ドキュメント」とは、小さなチャンクが元々由来したドキュメントを指します。これは、生のドキュメント全体または、より大きなチャンクのいずれかになります。

```python
from langchain.retrievers import ParentDocumentRetriever
```

```python
from langchain.storage import InMemoryStore
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
loaders = [
    TextLoader("../../paul_graham_essay.txt"),
    TextLoader("../../state_of_the_union.txt"),
]
docs = []
for loader in loaders:
    docs.extend(loader.load())
```

## 完全なドキュメントの取得

このモードでは、完全なドキュメントを取得したいと思います。そのため、子分割器のみを指定します。

```python
# This text splitter is used to create the child documents
child_splitter = RecursiveCharacterTextSplitter(chunk_size=400)
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="full_documents", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryStore()
retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=store,
    child_splitter=child_splitter,
)
```

```python
retriever.add_documents(docs, ids=None)
```

これで2つのキーが得られるはずです。2つのドキュメントを追加したためです。

```python
list(store.yield_keys())
```

```output
['cfdf4af7-51f2-4ea3-8166-5be208efa040',
 'bf213c21-cc66-4208-8a72-733d030187e6']
```

ベクトルストア検索機能を呼び出してみましょう。小さなチャンクが返されるはずです(小さなチャンクを保存しているため)。

```python
sub_docs = vectorstore.similarity_search("justice breyer")
```

```python
print(sub_docs[0].page_content)
```

```output
Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.
```

では、全体のリトリーバーから取得してみましょう。これにより、より大きなドキュメントが返されるはずです - 小さなチャンクが存在する場所のドキュメントが返されます。

```python
retrieved_docs = retriever.invoke("justice breyer")
```

```python
len(retrieved_docs[0].page_content)
```

```output
38540
```

## より大きなチャンクの取得

場合によっては、完全なドキュメントが大きすぎて、そのままでは取得したくない場合があります。その場合、まず生のドキュメントをより大きなチャンクに分割し、その後さらに小さなチャンクに分割するのが良いでしょう。小さなチャンクをインデックスしますが、取得時には大きなチャンクを取得します(完全なドキュメントは取得しません)。

```python
# This text splitter is used to create the parent documents
parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000)
# This text splitter is used to create the child documents
# It should create documents smaller than the parent
child_splitter = RecursiveCharacterTextSplitter(chunk_size=400)
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="split_parents", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryStore()
```

```python
retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=store,
    child_splitter=child_splitter,
    parent_splitter=parent_splitter,
)
```

```python
retriever.add_documents(docs)
```

2つ以上のドキュメントがあることがわかります - これらが大きなチャンクです。

```python
len(list(store.yield_keys()))
```

```output
66
```

基礎となるベクトルストアが依然として小さなチャンクを取得することを確認しましょう。

```python
sub_docs = vectorstore.similarity_search("justice breyer")
```

```python
print(sub_docs[0].page_content)
```

```output
Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.
```

```python
retrieved_docs = retriever.invoke("justice breyer")
```

```python
len(retrieved_docs[0].page_content)
```

```output
1849
```

```python
print(retrieved_docs[0].page_content)
```

```output
In state after state, new laws have been passed, not only to suppress the vote, but to subvert entire elections.

We cannot let this happen.

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
```
