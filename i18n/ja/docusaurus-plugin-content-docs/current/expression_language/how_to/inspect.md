---
translated: true
---

# ランナブルの検査

LCELでランナブルを作成した後、状況をより良く理解するために、それを検査したいことがよくあります。このノートブックでは、その方法について説明します。

まず、例としてLCELを作成しましょう。リトリーバーを行うものを作成します。

```python
%pip install --upgrade --quiet  langchain langchain-openai faiss-cpu tiktoken
```

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

```python
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
```

```python
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

## グラフの取得

ランナブルのグラフを取得できます。

```python
chain.get_graph()
```

## グラフの表示

それほど見やすくはありませんが、表示することで理解しやすくなります。

```python
chain.get_graph().print_ascii()
```

```output
           +---------------------------------+
           | Parallel<context,question>Input |
           +---------------------------------+
                    **               **
                 ***                   ***
               **                         **
+----------------------+              +-------------+
| VectorStoreRetriever |              | Passthrough |
+----------------------+              +-------------+
                    **               **
                      ***         ***
                         **     **
           +----------------------------------+
           | Parallel<context,question>Output |
           +----------------------------------+
                             *
                             *
                             *
                  +--------------------+
                  | ChatPromptTemplate |
                  +--------------------+
                             *
                             *
                             *
                      +------------+
                      | ChatOpenAI |
                      +------------+
                             *
                             *
                             *
                   +-----------------+
                   | StrOutputParser |
                   +-----------------+
                             *
                             *
                             *
                +-----------------------+
                | StrOutputParserOutput |
                +-----------------------+
```

## プロンプトの取得

チェーンの重要な部分はプロンプトです。チェーンに含まれるプロンプトを取得できます。

```python
chain.get_prompts()
```

```output
[ChatPromptTemplate(input_variables=['context', 'question'], messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['context', 'question'], template='Answer the question based only on the following context:\n{context}\n\nQuestion: {question}\n'))])]
```
