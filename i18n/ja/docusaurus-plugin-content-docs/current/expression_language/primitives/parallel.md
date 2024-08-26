---
keywords:
- RunnableParallel
- RunnableMap
- LCEL
sidebar_position: 1
title: '並列処理: データのフォーマット'
translated: true
---

# 入力と出力のフォーマット

`RunnableParallel`プリミティブは本質的に、値がrunnables(またはrunnablesに変換可能なもの、例えば関数)であるdictです。すべての値を並列に実行し、各値には全体の入力が渡されます。最終的な返り値は、適切なキーの下に各値の結果を持つdictです。

これは並列処理に役立ちますが、1つのRunnableの出力を次のRunnableの入力フォーマットに合わせて操作するのにも役立ちます。

ここでは、入力のpromptが"context"と"question"というキーを持つmapであることが期待されています。ユーザー入力は質問のみです。そのため、retrieverを使ってcontextを取得し、ユーザー入力を"question"キーの下に渡す必要があります。

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

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

::: {.callout-tip}
RunnableParallelと他のRunnableを組み合わせる際、辞書をRunnableParallelクラスでラップする必要はありません - 型変換が自動的に処理されます。チェーンの文脈では、これらは等価です:
:::

```python
{"context": retriever, "question": RunnablePassthrough()}
```

```python
RunnableParallel({"context": retriever, "question": RunnablePassthrough()})
```

```python
RunnableParallel(context=retriever, question=RunnablePassthrough())
```

## itemgetterを短縮形として使用する

Pythonの`itemgetter`を使って、mapからデータを抽出するための短縮形として使用できることに注意してください。`itemgetter`の詳細については、[Python Documentation](https://docs.python.org/3/library/operator.html#operator.itemgetter)を参照してください。

以下の例では、itemgetterを使ってmapから特定のキーを抽出しています:

```python
from operator import itemgetter

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

Answer in the following language: {language}
"""
prompt = ChatPromptTemplate.from_template(template)

chain = (
    {
        "context": itemgetter("question") | retriever,
        "question": itemgetter("question"),
        "language": itemgetter("language"),
    }
    | prompt
    | model
    | StrOutputParser()
)

chain.invoke({"question": "where did harrison work", "language": "italian"})
```

```output
'Harrison ha lavorato a Kensho.'
```

## ステップを並列化する

RunnableParallel (別名 RunnableMap) を使うと、複数のRunnableを並列に実行し、これらのRunnableの出力をmapとして返すことができます。

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel
from langchain_openai import ChatOpenAI

model = ChatOpenAI()
joke_chain = ChatPromptTemplate.from_template("tell me a joke about {topic}") | model
poem_chain = (
    ChatPromptTemplate.from_template("write a 2-line poem about {topic}") | model
)

map_chain = RunnableParallel(joke=joke_chain, poem=poem_chain)

map_chain.invoke({"topic": "bear"})
```

```output
{'joke': AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!"),
 'poem': AIMessage(content="In the wild's embrace, bear roams free,\nStrength and grace, a majestic decree.")}
```

## 並列性

RunnableParallelは、各Runnableが並列に実行されるため、独立したプロセスを並列に実行するのにも役立ちます。例えば、前述の`joke_chain`、`poem_chain`、`map_chain`はすべてほぼ同じ実行時間を持っているのがわかります。

```python
%%timeit

joke_chain.invoke({"topic": "bear"})
```

```output
958 ms ± 402 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```

```python
%%timeit

poem_chain.invoke({"topic": "bear"})
```

```output
1.22 s ± 508 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```

```python
%%timeit

map_chain.invoke({"topic": "bear"})
```

```output
1.15 s ± 119 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```
