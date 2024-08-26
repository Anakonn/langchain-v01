---
translated: true
---

# 多重ベクトルリトリーバー

ドキュメントごとに複数のベクトルを保存することが有益な場合がよくあります。これが有益な使用例がいくつかあります。LangChainには、この種のセットアップを簡単に照会できる基本的な `MultiVectorRetriever` があります。複雑さの大部分は、ドキュメントごとにどのように複数のベクトルを作成するかにあります。このノートブックでは、それらのベクトルを作成し、 `MultiVectorRetriever` を使用する一般的な方法について説明します。

ドキュメントごとに複数のベクトルを作成する方法には以下のようなものがあります:

- 小さな塊: ドキュメントを小さな塊に分割し、それらを埋め込む (これは `ParentDocumentRetriever` です)。
- サマリー: 各ドキュメントのサマリーを作成し、それをドキュメントと一緒に (または代わりに) 埋め込む。
- 仮想的な質問: ドキュメントが適切に答えられる仮想的な質問を作成し、それらをドキュメントと一緒に (または代わりに) 埋め込む。

これにより、別の埋め込み追加方法 - 手動 - も可能になります。これは素晴らしいことです。ドキュメントが検索されるべき質問や検索クエリを明示的に追加できるため、より多くの制御が可能になります。

```python
from langchain.retrievers.multi_vector import MultiVectorRetriever
```

```python
from langchain.storage import InMemoryByteStore
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
text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000)
docs = text_splitter.split_documents(docs)
```

## 小さな塊

多くの場合、より大きな情報の塊を取得することが有用ですが、より小さな塊を埋め込むことができます。これにより、意味的な意味をできるだけ正確に捉えつつ、できるだけ多くのコンテキストを下流に渡すことができます。これが `ParentDocumentRetriever` が行うことであることに注意してください。ここでは、その内部で何が行われているかを示します。

```python
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="full_documents", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryByteStore()
id_key = "doc_id"
# The retriever (empty to start)
retriever = MultiVectorRetriever(
    vectorstore=vectorstore,
    byte_store=store,
    id_key=id_key,
)
import uuid

doc_ids = [str(uuid.uuid4()) for _ in docs]
```

```python
# The splitter to use to create smaller chunks
child_text_splitter = RecursiveCharacterTextSplitter(chunk_size=400)
```

```python
sub_docs = []
for i, doc in enumerate(docs):
    _id = doc_ids[i]
    _sub_docs = child_text_splitter.split_documents([doc])
    for _doc in _sub_docs:
        _doc.metadata[id_key] = _id
    sub_docs.extend(_sub_docs)
```

```python
retriever.vectorstore.add_documents(sub_docs)
retriever.docstore.mset(list(zip(doc_ids, docs)))
```

```python
# Vectorstore alone retrieves the small chunks
retriever.vectorstore.similarity_search("justice breyer")[0]
```

```output
Document(page_content='Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.', metadata={'doc_id': '2fd77862-9ed5-4fad-bf76-e487b747b333', 'source': '../../state_of_the_union.txt'})
```

```python
# Retriever returns larger chunks
len(retriever.invoke("justice breyer")[0].page_content)
```

```output
9875
```

リトリーバーが ベクトルデータベースで実行する既定の検索タイプは類似性検索です。LangChain ベクトルストアは [Max Marginal Relevance](https://api.python.langchain.com/en/latest/vectorstores/langchain_core.vectorstores.VectorStore.html#langchain_core.vectorstores.VectorStore.max_marginal_relevance_search) による検索もサポートしているため、これを使用したい場合は `search_type` プロパティを次のように設定できます:

```python
from langchain.retrievers.multi_vector import SearchType

retriever.search_type = SearchType.mmr

len(retriever.invoke("justice breyer")[0].page_content)
```

```output
9875
```

## サマリー

多くの場合、サマリーにより、塊がどのようなものかをより正確に要約できるため、より良い検索結果が得られます。ここでは、サマリーの作成方法と、それらを埋め込む方法を示します。

```python
import uuid

from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
```

```python
chain = (
    {"doc": lambda x: x.page_content}
    | ChatPromptTemplate.from_template("Summarize the following document:\n\n{doc}")
    | ChatOpenAI(max_retries=0)
    | StrOutputParser()
)
```

```python
summaries = chain.batch(docs, {"max_concurrency": 5})
```

```python
# The vectorstore to use to index the child chunks
vectorstore = Chroma(collection_name="summaries", embedding_function=OpenAIEmbeddings())
# The storage layer for the parent documents
store = InMemoryByteStore()
id_key = "doc_id"
# The retriever (empty to start)
retriever = MultiVectorRetriever(
    vectorstore=vectorstore,
    byte_store=store,
    id_key=id_key,
)
doc_ids = [str(uuid.uuid4()) for _ in docs]
```

```python
summary_docs = [
    Document(page_content=s, metadata={id_key: doc_ids[i]})
    for i, s in enumerate(summaries)
]
```

```python
retriever.vectorstore.add_documents(summary_docs)
retriever.docstore.mset(list(zip(doc_ids, docs)))
```

```python
# # We can also add the original chunks to the vectorstore if we so want
# for i, doc in enumerate(docs):
#     doc.metadata[id_key] = doc_ids[i]
# retriever.vectorstore.add_documents(docs)
```

```python
sub_docs = vectorstore.similarity_search("justice breyer")
```

```python
sub_docs[0]
```

```output
Document(page_content="The document is a speech given by President Biden addressing various issues and outlining his agenda for the nation. He highlights the importance of nominating a Supreme Court justice and introduces his nominee, Judge Ketanji Brown Jackson. He emphasizes the need to secure the border and reform the immigration system, including providing a pathway to citizenship for Dreamers and essential workers. The President also discusses the protection of women's rights, including access to healthcare and the right to choose. He calls for the passage of the Equality Act to protect LGBTQ+ rights. Additionally, President Biden discusses the need to address the opioid epidemic, improve mental health services, support veterans, and fight against cancer. He expresses optimism for the future of America and the strength of the American people.", metadata={'doc_id': '56345bff-3ead-418c-a4ff-dff203f77474'})
```

```python
retrieved_docs = retriever.invoke("justice breyer")
```

```python
len(retrieved_docs[0].page_content)
```

```output
9194
```

## 仮想的な質問

LLMを使用して、特定のドキュメントに対して尋ねることができる仮想的な質問のリストを生成することもできます。これらの質問を埋め込むことができます。

```python
functions = [
    {
        "name": "hypothetical_questions",
        "description": "Generate hypothetical questions",
        "parameters": {
            "type": "object",
            "properties": {
                "questions": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
            "required": ["questions"],
        },
    }
]
```

```python
from langchain.output_parsers.openai_functions import JsonKeyOutputFunctionsParser

chain = (
    {"doc": lambda x: x.page_content}
    # Only asking for 3 hypothetical questions, but this could be adjusted
    | ChatPromptTemplate.from_template(
        "Generate a list of exactly 3 hypothetical questions that the below document could be used to answer:\n\n{doc}"
    )
    | ChatOpenAI(max_retries=0, model="gpt-4").bind(
        functions=functions, function_call={"name": "hypothetical_questions"}
    )
    | JsonKeyOutputFunctionsParser(key_name="questions")
)
```

```python
chain.invoke(docs[0])
```

```output
["What was the author's first experience with programming like?",
 'Why did the author switch their focus from AI to Lisp during their graduate studies?',
 'What led the author to contemplate a career in art instead of computer science?']
```

```python
hypothetical_questions = chain.batch(docs, {"max_concurrency": 5})
```

```python
# The vectorstore to use to index the child chunks
vectorstore = Chroma(
    collection_name="hypo-questions", embedding_function=OpenAIEmbeddings()
)
# The storage layer for the parent documents
store = InMemoryByteStore()
id_key = "doc_id"
# The retriever (empty to start)
retriever = MultiVectorRetriever(
    vectorstore=vectorstore,
    byte_store=store,
    id_key=id_key,
)
doc_ids = [str(uuid.uuid4()) for _ in docs]
```

```python
question_docs = []
for i, question_list in enumerate(hypothetical_questions):
    question_docs.extend(
        [Document(page_content=s, metadata={id_key: doc_ids[i]}) for s in question_list]
    )
```

```python
retriever.vectorstore.add_documents(question_docs)
retriever.docstore.mset(list(zip(doc_ids, docs)))
```

```python
sub_docs = vectorstore.similarity_search("justice breyer")
```

```python
sub_docs
```

```output
[Document(page_content='Who has been nominated to serve on the United States Supreme Court?', metadata={'doc_id': '0b3a349e-c936-4e77-9c40-0a39fc3e07f0'}),
 Document(page_content="What was the context and content of Robert Morris' advice to the document's author in 2010?", metadata={'doc_id': 'b2b2cdca-988a-4af1-ba47-46170770bc8c'}),
 Document(page_content='How did personal circumstances influence the decision to pass on the leadership of Y Combinator?', metadata={'doc_id': 'b2b2cdca-988a-4af1-ba47-46170770bc8c'}),
 Document(page_content='What were the reasons for the author leaving Yahoo in the summer of 1999?', metadata={'doc_id': 'ce4f4981-ca60-4f56-86f0-89466de62325'})]
```

```python
retrieved_docs = retriever.invoke("justice breyer")
```

```python
len(retrieved_docs[0].page_content)
```

```output
9194
```
