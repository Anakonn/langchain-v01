---
keywords:
- RunnablePassthrough
- assign
- LCEL
sidebar_position: 6
title: '割り当て: 状態に値を追加する'
translated: true
---

# 状態に値を追加する

`RunnablePassthrough.assign(...)` 静的メソッドは、入力値を受け取り、assign関数に渡された追加の引数を状態に追加します。

これは、後のステップの入力として使用する辞書を累積的に作成する際に便利です。これは一般的な LCEL パターンです。

以下に例を示します:

```python
%pip install --upgrade --quiet langchain langchain-openai
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 24.0 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

runnable = RunnableParallel(
    extra=RunnablePassthrough.assign(mult=lambda x: x["num"] * 3),
    modified=lambda x: x["num"] + 1,
)

runnable.invoke({"num": 1})
```

```output
{'extra': {'num': 1, 'mult': 3}, 'modified': 2}
```

ここで起こっていることを説明します。

- チェーンへの入力は `{"num": 1}` です。これは `RunnableParallel` に渡され、渡されたランナブルを並列に呼び出します。
- `extra` キーの値が呼び出されます。`RunnablePassthrough.assign()` は入力辞書 (`{"num": 1}`) の元のキーを保持し、新しいキー `mult` を割り当てます。値は `lambda x: x["num"] * 3)` で、`3` になります。したがって、結果は `{"num": 1, "mult": 3}` になります。
- `{"num": 1, "mult": 3}` は `RunnableParallel` の呼び出しに返され、`extra` キーの値として設定されます。
- 同時に、`modified` キーが呼び出されます。結果は `2` になります。これは、ラムダが入力から `"num"` キーを抽出し、1を加えるためです。

したがって、最終的な結果は `{'extra': {'num': 1, 'mult': 3}, 'modified': 2}` になります。

## ストリーミング

このメソッドの素晴らしい機能の1つは、値が利用可能になるとすぐに渡すことができることです。これを示すために、`RunnablePassthrough.assign()` を使って、取得チェーンですぐにソースドキュメントを返すようにします:

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

generation_chain = prompt | model | StrOutputParser()

retrieval_chain = {
    "context": retriever,
    "question": RunnablePassthrough(),
} | RunnablePassthrough.assign(output=generation_chain)

stream = retrieval_chain.stream("where did harrison work?")

for chunk in stream:
    print(chunk)
```

```output
{'question': 'where did harrison work?'}
{'context': [Document(page_content='harrison worked at kensho')]}
{'output': ''}
{'output': 'H'}
{'output': 'arrison'}
{'output': ' worked'}
{'output': ' at'}
{'output': ' Kens'}
{'output': 'ho'}
{'output': '.'}
{'output': ''}
```

最初のチャンクには元の `"question"` が含まれていることがわかります。これは即座に利用可能だからです。2番目のチャンクには `"context"` が含まれています。これは、リトリーバーが2番目に完了したためです。最後に、`generation_chain` の出力がすぐに利用可能になるチャンクでストリーミングされます。
