---
keywords:
- RunnablePassthrough
- LCEL
sidebar_position: 5
title: 'パススルー: 入力をそのまま渡す'
translated: true
---

# データのパススルー

RunnablePassthroughを単独で使うと、入力をそのまま渡すことができます。これは通常、RunnableParallelと組み合わせて使われ、マップの新しいキーにデータを渡すために使用されます。

以下の例を参照してください:

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

runnable = RunnableParallel(
    passed=RunnablePassthrough(),
    modified=lambda x: x["num"] + 1,
)

runnable.invoke({"num": 1})
```

```output
{'passed': {'num': 1}, 'extra': {'num': 1, 'mult': 3}, 'modified': 2}
```

上記のように、`passed`キーは`RunnablePassthrough()`を使って呼び出されているため、単に`{'num': 1}`をそのまま渡しています。

また、`modified`という2つ目のキーを設定しています。これはラムダ式を使って、numに1を加えた値を設定しています。その結果、`modified`キーの値は`2`となりました。

## 取得例

以下の例では、`RunnablePassthrough`と`RunnableParallel`を組み合わせて使う使用例を見ることができます。

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()
template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)
model = ChatOpenAI()

retrieval_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)

retrieval_chain.invoke("where did harrison work?")
```

```output
'Harrison worked at Kensho.'
```

ここでは、promptへの入力は"context"と"question"というキーを持つマップが期待されています。ユーザーの入力は質問のみです。そのため、retrieverを使ってcontextを取得し、ユーザーの質問を"question"キーでパススルーする必要があります。この場合、RunnablePassthroughを使うことで、ユーザーの質問をpromptとモデルにそのまま渡すことができます。
