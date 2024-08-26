---
sidebar_position: 4
translated: true
---

# ユーザー別の検索

検索アプリを構築する際は、複数のユーザーを念頭に置く必要があります。つまり、1人のユーザーだけでなく、多数のユーザーのデータを保存する必要があり、ユーザー間でデータを共有してはいけません。そのため、検索チェーンを構成して、特定の情報のみを取得できるようにする必要があります。これには通常2つのステップが必要です。

**ステップ1: 使用する検索器がマルチユーザーをサポートしていることを確認する**

現時点では、LangChainにはマルチユーザーをサポートする統一的なフラグやフィルターはありません。代わりに、各ベクトルストアやリトリーバーが独自の方法(名前空間、マルチテナンシーなど)を持っています。ベクトルストアの場合、これは通常 `similarity_search` の際に渡されるキーワード引数として公開されています。ドキュメントやソースコードを読んで、使用しているリトリーバーがマルチユーザーをサポートしているかどうか、そしてどのように使用するかを確認してください。

注意: マルチユーザーをサポートしていない(またはドキュメント化されていない)リトリーバーにそのサポートを追加することは、LangChainに大きく貢献できる方法です。

**ステップ2: チェーンの設定可能なフィールドとしてそのパラメーターを追加する**

これにより、チェーンを簡単に呼び出し、実行時に関連するフラグを設定できるようになります。設定に関する詳細は、[このドキュメント](/docs/expression_language/primitives/configure)を参照してください。

**ステップ3: 設定可能なフィールドを使ってチェーンを呼び出す**

これで、実行時にこのチェーンを設定可能なフィールドとともに呼び出すことができます。

## コード例

Pineconeを使った具体的な例を見てみましょう。

Pineconeを設定するには、次の環境変数を設定する必要があります:

- `PINECONE_API_KEY`: PineconeのAPIキー

```python
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
```

```python
embeddings = OpenAIEmbeddings()
vectorstore = PineconeVectorStore(index_name="test-example", embedding=embeddings)

vectorstore.add_texts(["i worked at kensho"], namespace="harrison")
vectorstore.add_texts(["i worked at facebook"], namespace="ankush")
```

```output
['ce15571e-4e2f-44c9-98df-7e83f6f63095']
```

Pineconeの `namespace` 引数を使ってドキュメントを分離できます。

```python
# This will only get documents for Ankush
vectorstore.as_retriever(search_kwargs={"namespace": "ankush"}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at facebook')]
```

```python
# This will only get documents for Harrison
vectorstore.as_retriever(search_kwargs={"namespace": "harrison"}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at kensho')]
```

質問応答に使用するチェーンを作成します。

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import (
    ConfigurableField,
    RunnableBinding,
    RunnableLambda,
    RunnablePassthrough,
)
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

これは基本的な質問応答チェーンの設定です。

```python
template = """Answer the question based only on the following context:
{context}
Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI()

retriever = vectorstore.as_retriever()
```

ここでリトリーバーを設定可能なフィールドとしてマークします。すべてのベクトルストアリトリーバーには `search_kwargs` というフィールドがあります。これは単なる辞書で、ベクトルストア固有のフィールドが含まれています。

```python
configurable_retriever = retriever.configurable_fields(
    search_kwargs=ConfigurableField(
        id="search_kwargs",
        name="Search Kwargs",
        description="The search kwargs to use",
    )
)
```

設定可能なリトリーバーを使ってチェーンを作成します。

```python
chain = (
    {"context": configurable_retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

設定可能なオプションを使ってチェーンを呼び出すことができます。 `search_kwargs` は設定可能なフィールドのIDです。値はPineconeの検索パラメーターです。

```python
chain.invoke(
    "where did the user work?",
    config={"configurable": {"search_kwargs": {"namespace": "harrison"}}},
)
```

```output
'The user worked at Kensho.'
```

```python
chain.invoke(
    "where did the user work?",
    config={"configurable": {"search_kwargs": {"namespace": "ankush"}}},
)
```

```output
'The user worked at Facebook.'
```

マルチユーザー対応のその他のベクトルストア実装については、[Milvus](/docs/integrations/vectorstores/milvus)などの個別のページを参照してください。
